import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { loggerWithModule } from '../logger';
import { ServerContext, TransactionToSend, TransactionToSendWithCapacity } from '../types';
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
      // transfering multiple udt at the same time and mixing acp with non-acp
      // will cause an ERROR_NO_PAIR error in the acp-lock
      // so transfer one after another
      const unsendTransactions = await addTransferCapacity(selectOneKindSudt(unsendTransactionsWithMixedSudts));
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
            await db.updateStatusAndErrorBySecrets(secrets, errorString, 'SendTransactionError');
            await utils.sleep(300000);
          }
        } catch (e) {
          logger.error(`An error caught while build transfer sudt tx: ${e}`);
          logger.error(`Gonna sleep 5 mins after build tx failed`);
          const errorString = e instanceof Error ? e.toString() : String(e);
          await db.updateStatusAndErrorBySecrets(secrets, errorString, 'BuildTransactionError');
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
  const selectedSudtTx = txes[txes.length - 1]!;
  return txes.filter(
    (tx) =>
      tx.sudt_id === selectedSudtTx.sudt_id &&
      tx.sudt_issuer_rc_id_flag === selectedSudtTx.sudt_issuer_rc_id_flag &&
      tx.sudt_issuer_pubkey_hash === selectedSudtTx.sudt_issuer_pubkey_hash,
  );
}

async function addTransferCapacity(txes: TransactionToSend[]): Promise<TransactionToSendWithCapacity[]> {
  if (!process.env.TRANSFER_CAPACITY_FIRST) throw new Error('env TRANSFER_CAPACITY_FIRST not set');
  if (!process.env.TRANSFER_CAPACITY_LATER) throw new Error('env TRANSFER_CAPACITY_LATER not set');

  const ret: TransactionToSendWithCapacity[] = [];
  for (const tx of txes) {
    const firstRecordId = await DB.getInstance().firstRecordId(
      tx.mail_address,
      tx.sudt_id,
      tx.sudt_issuer_pubkey_hash,
      tx.sudt_issuer_rc_id_flag,
    );
    if (!firstRecordId) throw new Error('exception: can not find first record when addTransferCapacity');
    const capacity = firstRecordId < tx.id ? process.env.TRANSFER_CAPACITY_LATER : process.env.TRANSFER_CAPACITY_FIRST;
    ret.push({ ...tx, capacity });
  }
  return ret;
}
