import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { loggerWithModule } from '../logger';
import { ServerContext, TransactionToSend } from '../types';
import { TransactionManage } from './TransactionManage';

const logger = loggerWithModule('TransferSudt');

export async function startTransferSudt(context: ServerContext): Promise<void> {
  const txManage = new TransactionManage(context.ckitProvider, context.txSigner, context.rcHelper);
  const db = DB.getInstance();
  logger.info('Transfer sudt routine started');

  for (;;) {
    try {
      const unsendTransactionsWithMixedSudts = await db.getTransactionsToSend(
        (process.env.BATCH_TRANSACTION_LIMIT as unknown as number) ?? 50,
      );
      const unsendTransactions = selectOneKindSudt(unsendTransactionsWithMixedSudts);
      logger.info(
        `New transfer sudt round with records: ${
          unsendTransactions.length ? JSON.stringify(unsendTransactions) : '[]'
        }`,
      );
      const secrets = unsendTransactions.map((value) => value.secret);
      if (unsendTransactions.length > 0) {
        try {
          const signedTx = await txManage.buildTransaction(unsendTransactions);
          logger.info(`Built signed-transfer-sudt-tx: ${JSON.stringify(signedTx)}`);
          await db.updateStatusBySecrets(secrets, 'SendingTransaction');
          try {
            const txHash = await txManage.sendTransaction(signedTx);
            logger.info(`Send transfer sudt, tx hash: ${txHash}`);
            await db.updateTxHashBySecrets(secrets, txHash, 'WaitForTransactionCommit');
            await txManage.waitForCommit(txHash);
            logger.info(`Transfer sudt tx(${txHash}) committed`);
            await db.updateStatusBySecrets(secrets, 'WaitForTransactionConfirm');
          } catch (e) {
            logger.error(`An error caught while send transfer sudt tx: ${e}`);
            const errorString = e instanceof Error ? e.toString() : String(e);
            await db.updateErrorBySecrets(secrets, errorString, 'SendTransactionError');
            await utils.sleep(300000);
          }
        } catch (e) {
          logger.error(`An error caught while build transfer sudt tx: ${e}`);
          logger.error(`Gonna sleep 5 mins after build tx failed`);
          const errorString = e instanceof Error ? e.toString() : String(e);
          await db.updateErrorBySecrets(secrets, errorString, 'BuildTransactionError');
          await utils.sleep(300000);
        }
      }
    } catch (e) {
      logger.error(`An error caught from db: ${e}`);
    }
    await utils.sleep(15000);
  }
}

function selectOneKindSudt(txes: TransactionToSend[]): TransactionToSend[] {
  if (txes.length === 0) return txes;
  const selectedSudtTx = txes[0];
  return txes.filter(
    (tx) =>
      tx.sudt_id === selectedSudtTx!.sudt_id &&
      tx.sudt_issuer_rc_id_flag === selectedSudtTx!.sudt_issuer_rc_id_flag &&
      tx.sudt_issuer_pubkey_hash === selectedSudtTx!.sudt_issuer_pubkey_hash,
  );
}
