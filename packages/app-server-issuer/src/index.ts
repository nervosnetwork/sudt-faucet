import { CkitProvider, internal, predefined } from '@ckitjs/ckit';
import dotenv from 'dotenv';
import { startRpcServer } from './rpc-server';
import { startSendGrid } from './sendgrid';
import { startTransferSudt } from './transfer-sudt';
import { ServerContext } from './types';

async function main() {
  const context = await initContext();
  void startSendGrid();
  void startTransferSudt(context);
  startRpcServer(context);
}

async function initContext(): Promise<ServerContext> {
  dotenv.config();
  if (!process.env.CKB_NODE_URL) throw new Error('env CKB_NODE_URL not set');
  if (!process.env.CKB_INDEXER_URL) throw new Error('env CKB_INDEXER_URL not set');
  if (!process.env.PRIVATE_KEY) throw new Error('env PRIVATE_KEY not set');
  const ckitProvider = new CkitProvider(process.env.CKB_INDEXER_URL, process.env.CKB_NODE_URL);
  await ckitProvider.init(predefined.Aggron);
  // TODO get private key from keystore
  const txSigner = new internal.Secp256k1Signer(process.env.PRIVATE_KEY, ckitProvider, {
    code_hash: ckitProvider.getScriptConfig('SECP256K1_BLAKE160').CODE_HASH,
    hash_type: ckitProvider.getScriptConfig('SECP256K1_BLAKE160').HASH_TYPE,
  });
  return { ckitProvider, txSigner };
}

void main();
