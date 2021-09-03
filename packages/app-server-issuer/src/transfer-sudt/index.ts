import { CkitProvider, RcSupplyLockHelper, internal, predefined } from '@ckit/ckit';
import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { TransactionToSend } from '../types';
import { TransactionManage } from './TransactionManage';

const BATCH_TRANSACTION_LIMIT = 100;

export async function startTransferSudt(): Promise<void> {
  const txManage = await initTransactionManage();
  const db = DB.getInstance();

  for (;;) {
    const unsendTransactions = await db.getTransactionsToSend(BATCH_TRANSACTION_LIMIT);
    if (unsendTransactions.length > 0) {
      await db.updateStatusBySecrets(
        unsendTransactions.map((value) => value.secret),
        'sending',
      );
      const transactionsGroup = transactionsGroupBySudtId(unsendTransactions);
      const sendTransactionPromises = new Array(0);
      transactionsGroup.forEach((group) => sendTransactionPromises.push(txManage.sendTransaction(group)));
      const txHashes = await Promise.all(sendTransactionPromises);
      transactionsGroup.forEach(async (group, index) => {
        const secrets = group.map((value) => value.secret);
        await db.updateTxHashBySecrets(secrets, txHashes[index], 'sended');
      });

      await txManage.waitForCommit(txHashes);
    } else {
      await utils.sleep(15000);
    }

    await txManage.syncConfirmNumber();
  }
}

async function initTransactionManage(): Promise<TransactionManage> {
  // TODO use config
  const provider = new CkitProvider('https://testnet.ckb.dev/indexer', 'https://testnet.ckb.dev/rpc');
  await provider.init(predefined.Aggron);
  // TODO get private key from keystore
  const signer = new internal.RcInternalSigner(utils.randomHexString(64), provider);
  const rcHelper = new RcSupplyLockHelper(provider.mercury, {
    rcLock: {
      code_hash: provider.getScriptConfig('RC_LOCK').CODE_HASH,
      hash_type: provider.getScriptConfig('RC_LOCK').HASH_TYPE,
    },
    sudtType: {
      code_hash: provider.getScriptConfig('SUDT').CODE_HASH,
      hash_type: provider.getScriptConfig('SUDT').HASH_TYPE,
    },
  });

  return new TransactionManage(provider, signer, rcHelper);
}

function transactionsGroupBySudtId(txs: TransactionToSend[]): TransactionToSend[][] {
  const ret = new Array(0);

  const sudtIds = new Array(0);
  txs.forEach((tx) => {
    if (!sudtIds.find((id) => id === tx.sudt_id)) sudtIds.push(tx.sudt_id);
  });
  sudtIds.forEach((id) => {
    const txsWithSameId = txs.filter((tx) => tx.sudt_id === id);
    ret.push(txsWithSameId);
  });

  return ret;
}
