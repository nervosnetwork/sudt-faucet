import { CkitInitOptions, predefined } from '@ckitjs/ckit';

interface GlobalConfig {
  ckitConfig: CkitInitOptions;
  mercuryUrl: string;
  ckbRpcUrl: string;
  unipassUrl: string;
  walletUrl: string;
}

function getConfig(): GlobalConfig {
  const network = process.env.NETWORK;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ckitConfig = network === 'Lina' ? (predefined.Lina as CkitInitOptions) : predefined.Aggron;

  return {
    ckitConfig,
    ckbRpcUrl: process.env.MERCURY_URL ?? 'https://testnet.ckb.dev/rpc',
    mercuryUrl: process.env.RPC_URL ?? 'https://testnet.ckb.dev/indexer',
    unipassUrl: process.env.UNIPASS_URL ?? 'https://t.unipass.xyz',
    walletUrl: process.env.WALLET_URL ?? 'https://t.tok.social',
  };
}

const DEFAULT_CONFIG = getConfig();

export function useGlobalConfig(): GlobalConfig {
  return DEFAULT_CONFIG;
}
