import { CkitProvider, internal, predefined, RcSupplyLockHelper } from '@ckitjs/ckit';
import { DB } from './db';
import { startRpcServer } from './rpc-server';
import { startSendGrid } from './sendgrid';
import { startTransferSudt } from './transfer-sudt';
import { ServerContext } from './types';

async function main() {
  const context = await initContext();
  void startSendGrid(context);
  void startTransferSudt(context);
  startRpcServer(context);
}

async function initContext(): Promise<ServerContext> {
  await DB.init();

  if (!process.env.CKB_NODE_URL) throw new Error('env CKB_NODE_URL not set');
  if (!process.env.CKB_INDEXER_URL) throw new Error('env CKB_INDEXER_URL not set');
  if (!process.env.PRIVATE_KEY) throw new Error('env PRIVATE_KEY not set');
  const ckitProvider = new CkitProvider(process.env.CKB_INDEXER_URL, process.env.CKB_NODE_URL);
  const networkConfig = process.env.NETWORK === 'Lina' ? predefined.Lina : predefined.Aggron;
  await ckitProvider.init(networkConfig);
  // TODO get private key from keystore
  const txSigner = new internal.Secp256k1Signer(
    process.env.PRIVATE_KEY,
    ckitProvider,
    ckitProvider.newScript('ANYONE_CAN_PAY'),
  );
  const rcHelper = new RcSupplyLockHelper(ckitProvider.mercury, {
    rcLock: {
      code_hash: ckitProvider.getScriptConfig('RC_LOCK').CODE_HASH,
      hash_type: ckitProvider.getScriptConfig('RC_LOCK').HASH_TYPE,
    },
    sudtType: {
      code_hash: ckitProvider.getScriptConfig('SUDT').CODE_HASH,
      hash_type: ckitProvider.getScriptConfig('SUDT').HASH_TYPE,
    },
  });
  return { ckitProvider, txSigner, rcHelper };
}

void main();
