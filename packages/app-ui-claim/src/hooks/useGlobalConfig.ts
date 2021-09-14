import { CkitInitOptions, predefined } from '@ckitjs/ckit';
import { env } from '@sudt-faucet/commons';

interface GlobalConfig {
  ckitConfig: CkitInitOptions;
  mercuryUrl: string;
  ckbRpcUrl: string;
  unipassUrl: string;
  walletUrl: string;
}

function getConfig(): GlobalConfig {
  const ckitConfig = env.readAsStr('NETWORK', 'Aggron') === 'Lina' ? predefined.Lina : predefined.Aggron;

  return {
    ckitConfig,
    ckbRpcUrl: env.readAsStr('CKB_NODE_URL', 'https://testnet.ckb.dev/rpc'),
    mercuryUrl: env.readAsStr('CKB_INDEXER_URL', 'https://testnet.ckb.dev/indexer'),
    unipassUrl: env.readAsStr('UNIPASS_URL', 'https://t.unipass.xyz'),
    walletUrl: env.readAsStr('WALLET_URL', 'https://t.tok.social'),
  };
}

const DEFAULT_CONFIG = getConfig();

export function useGlobalConfig(): GlobalConfig {
  return DEFAULT_CONFIG;
}
