import { CkitProvider, internal, predefined, RcSupplyLockHelper } from '@ckitjs/ckit';
import { BI as BigNumber } from '@ckb-lumos/lumos';
import { DB } from './db';
import { ExchangeProviderManager } from './exchange-provider/ExchangeProviderManager';
import { startMailSender } from './mail-sender';
import { startRpcServer } from './rpc-server';
import { startTransferSudt } from './transfer-sudt';
import { ServerContext } from './types';

async function main() {
  const context = await initContext();
  void startMailSender(context);
  void startTransferSudt(context);
  await ExchangeProviderManager.getInstance().initiateConfig(
    {
      exchangeCellCount: parseInt(process.env.CELL_AMOUNT!, 10),
      sudtArgs: process.env.SUDT_ARGS!,
      initCapacity: parseInt(process.env.INIT_CAPACITY!),
      exchange: {
        sUDT: BigNumber.from(process.env.SUDT_EXCHANGE_AMOUNT),
        CKB: BigNumber.from(process.env.CKB_EXCHANGE_AMOUNT),
      },
    },
    context,
  );
  startRpcServer(context);
}

async function initContext(): Promise<ServerContext> {
  await DB.init();

  if (!process.env.CKB_NODE_URL) throw new Error('env CKB_NODE_URL not set');
  if (!process.env.CKB_INDEXER_URL) throw new Error('env CKB_INDEXER_URL not set');
  if (!process.env.PRIVATE_KEY) throw new Error('env PRIVATE_KEY not set');
  if (!process.env.TRANSFER_ADDITIONAL_CAPACITY_FIRST)
    throw new Error('env TRANSFER_ADDITIONAL_CAPACITY_FIRST  not set');
  if (!process.env.TRANSFER_ADDITIONAL_CAPACITY_LATER)
    throw new Error('env TRANSFER_ADDITIONAL_CAPACITY_LATER not set');
  const ckitProvider = new CkitProvider(process.env.CKB_INDEXER_URL, process.env.CKB_NODE_URL);
  const networkConfig = process.env.NETWORK === 'Lina' ? predefined.Lina : predefined.Aggron;
  await ckitProvider.init(networkConfig);
  // TODO get private key from keystore
  const privateKey = process.env.PRIVATE_KEY;
  const txSigner = new internal.Secp256k1Signer(privateKey, ckitProvider, ckitProvider.newScript('ANYONE_CAN_PAY'));
  const exchangeSigner = new internal.Secp256k1Signer(
    privateKey,
    ckitProvider,
    ckitProvider.newScript('SECP256K1_BLAKE160'),
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
  return { ckitProvider, txSigner, rcHelper, exchangeSigner };
}

void main();
