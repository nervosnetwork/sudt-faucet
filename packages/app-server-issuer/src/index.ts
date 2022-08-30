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
  if (context.exchangeSigner) {
    await initiateExchangeProvider(context);
  }
  startRpcServer(context);
}

async function initiateExchangeProvider(context: ServerContext): Promise<void> {
  await ExchangeProviderManager.getInstance().initiateConfig(
    {
      exchangeCellCount: parseInt(process.env.EXCHANGE_CELL_COUNT!, 10),
      sudtArgs: process.env.EXCHANGE_SUDT_ARGS!,
      initCapacity: BigNumber.from(process.env.EXCHANGE_INIT_CAPACITY!),
      exchange: {
        pairedBaseSUDTPrice: BigNumber.from(process.env.EXCHANGE_SUDT_AMOUNT),
        pairedQuoteCKBPrice: BigNumber.from(process.env.EXCHANGE_CKB_AMOUNT),
        maxCapacityPerExchange: BigNumber.from(process.env.EXCHANGE_CKB_LIMIT_EACH_TRANSACTION ?? 0),
      },
    },
    context,
  );
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
  const exchangePrivateKey = process.env.EXCHANGE_PRIVATE_KEY;
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
  return {
    ckitProvider,
    txSigner,
    rcHelper,
    exchangeSigner: exchangePrivateKey
      ? new internal.Secp256k1Signer(exchangePrivateKey, ckitProvider, ckitProvider.newScript('ANYONE_CAN_PAY'))
      : undefined,
  };
}

void main();
