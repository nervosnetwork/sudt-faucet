import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { logger } from '../logger';
import { ServerContext } from '../types';
import { TransactionManage } from './TransactionManage';

export async function startTransferSudt(context: ServerContext): Promise<void> {
  const txManage = new TransactionManage(context.ckitProvider, context.txSigner, context.rcHelper);
  const db = DB.getInstance();

  for (;;) {
    try {
      const unsendTransactions = await db.getTransactionsToSend(
        (process.env.BATCH_TRANSACTION_LIMIT as unknown as number) ?? 50,
      );
      const secrets = unsendTransactions.map((value) => value.secret);
      logger.info(
        `New transfer sudt round with records: ${
          unsendTransactions.length ? JSON.stringify(unsendTransactions) : '[]'
        }`,
      );
      if (unsendTransactions.length > 0) {
        try {
          await db.updateStatusBySecrets(secrets, 'SendingTransaction');
          const txHash = await txManage.sendTransaction(unsendTransactions);
          logger.info(`Send transfer sudt, tx hash: ${txHash}`);
          await db.updateTxHashBySecrets(secrets, txHash, 'WaitForTransactionCommit');
          await txManage.waitForCommit(txHash);
          logger.info(`Transfer sudt tx(${txHash}) committed`);
          await db.updateStatusBySecrets(secrets, 'WaitForTransactionConfirm');
        } catch (e) {
          logger.error(`An error caught while transfer sudt: ${e}`);
          const errorString = e instanceof Error ? e.toString() : String(e);
          await db.updateErrorBySecrets(secrets, errorString, 'TransferSudtError');
          await utils.sleep(300000);
        }
      }
    } catch (e) {
      logger.error(`An error caught from db: ${e}`);
    }
    await utils.sleep(15000);
  }
}
