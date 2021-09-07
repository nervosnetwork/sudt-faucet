import { CkitProvider, RcSupplyLockHelper, internal, predefined, RcIdentityFlag } from '@ckit/ckit';
import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { TransactionManage } from './TransactionManage';

export async function startTransferSudt(): Promise<void> {
  const txManage = await initTransactionManage();
  const db = DB.getInstance();

  for (;;) {
    const unsendTransactions = await db.getTransactionsToSend(
      (process.env.BATCH_TRANSACTION_LIMIT as unknown as number) ?? 100,
    );
    if (unsendTransactions.length > 0) {
      await db.updateStatusBySecrets(
        unsendTransactions.map((value) => value.secret),
        'sending',
      );

      const txHash = await txManage.sendTransaction(unsendTransactions);
      const secrets = unsendTransactions.map((value) => value.secret);
      await db.updateTxHashBySecrets(secrets, txHash, 'sended');

      await txManage.waitForCommit(txHash);
    } else {
      await utils.sleep(15000);
    }

    await txManage.syncConfirmNumber();
  }
}

async function initTransactionManage(): Promise<TransactionManage> {
  if (!process.env.CKB_NODE_URL) throw new Error('env CKB_NODE_URL not set');
  if (!process.env.CKB_INDEXER_URL) throw new Error('env CKB_INDEXER_URL not set');
  if (!process.env.PRIVATE_KEY) throw new Error('env PRIVATE_KEY not set');
  if (!process.env.SUDT_RC_ID_FLAG) throw new Error('env SUDT_RC_ID_FLAG not set');
  if (!process.env.SUDT_ISSUER_PUBKEY_HASH) throw new Error('env SUDT_ISSUER_PUBKEY_HASH not set');
  const provider = new CkitProvider(process.env.CKB_INDEXER_URL, process.env.CKB_NODE_URL);
  await provider.init(predefined.Aggron);
  // TODO get private key from keystore
  const signer = new internal.Secp256k1Signer(process.env.PRIVATE_KEY, provider, {
    code_hash: provider.getScriptConfig('SECP256K1_BLAKE160').CODE_HASH,
    hash_type: provider.getScriptConfig('SECP256K1_BLAKE160').HASH_TYPE,
  });
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

  const rcIdFlag: RcIdentityFlag = (() => {
    switch (process.env.SUDT_RC_ID_FLAG) {
      case 'ETH':
        return RcIdentityFlag.ETH;
      case 'CKB':
        return RcIdentityFlag.CKB;
      default:
        throw new Error('unknown SUDT_RC_ID_FLAG');
    }
  })();

  return new TransactionManage(provider, signer, rcHelper, {
    flag: rcIdFlag,
    pubkeyHash: process.env.SUDT_ISSUER_PUBKEY_HASH,
  });
}
