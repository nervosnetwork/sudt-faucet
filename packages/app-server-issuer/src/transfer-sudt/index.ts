import { RcSupplyLockHelper } from '@ckitjs/ckit';
import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { ServerContext } from '../types';
import { TransactionManage } from './TransactionManage';

export async function startTransferSudt(context: ServerContext): Promise<void> {
  const txManage = await initTransactionManage(context);
  const db = DB.getInstance();

  for (;;) {
    const unsendTransactions = await db.getTransactionsToSend(
      (process.env.BATCH_TRANSACTION_LIMIT as unknown as number) ?? 100,
    );
    if (unsendTransactions.length > 0) {
      await db.updateStatusBySecrets(
        unsendTransactions.map((value) => value.secret),
        'SendingTransaction',
      );
      const txHash = await txManage.sendTransaction(unsendTransactions);
      const secrets = unsendTransactions.map((value) => value.secret);
      await db.updateTxHashBySecrets(secrets, txHash, 'WaitForTransactionCommit');
      await txManage.waitForCommit(txHash);
      await db.updateTxHashBySecrets(secrets, txHash, 'WaitForTransactionConfrim');
    } else {
      await utils.sleep(15000);
    }
    // await txManage.syncConfirmNumber();
  }
}

async function initTransactionManage(context: ServerContext): Promise<TransactionManage> {
  const rcHelper = new RcSupplyLockHelper(context.ckitProvider.mercury, {
    rcLock: {
      code_hash: context.ckitProvider.getScriptConfig('RC_LOCK').CODE_HASH,
      hash_type: context.ckitProvider.getScriptConfig('RC_LOCK').HASH_TYPE,
    },
    sudtType: {
      code_hash: context.ckitProvider.getScriptConfig('SUDT').CODE_HASH,
      hash_type: context.ckitProvider.getScriptConfig('SUDT').HASH_TYPE,
    },
  });

  return new TransactionManage(context.ckitProvider, context.txSigner, rcHelper);
}
