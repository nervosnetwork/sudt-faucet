import { CkitInitOptions, predefined } from '@ckitjs/ckit';
import { env } from '@sudt-faucet/commons';

interface GlobalConfig {
  ckitConfig: CkitInitOptions;
  mercuryUrl: string;
  ckbRpcUrl: string;
  unipassUrl: string;
  walletUrl: string;
  nervosExploreTxUrlPrefix: string;
}

function getConfig(): GlobalConfig {
  const ckitConfig = env.readAsStr('REACT_APP_NETWORK') === 'Lina' ? predefined.Lina : predefined.Aggron;
  const NERVOS_EXPLORER_URL = env.readAsStr('REACT_APP_NERVOS_EXPLORER_URL');

  return {
    ckitConfig,
    ckbRpcUrl: env.readAsStr('REACT_APP_CKB_NODE_URL'),
    mercuryUrl: env.readAsStr('REACT_APP_CKB_INDEXER_URL'),
    unipassUrl: env.readAsStr('REACT_APP_UNIPASS_URL'),
    walletUrl: env.readAsStr('REACT_APP_WALLET_URL'),
    nervosExploreTxUrlPrefix: `${NERVOS_EXPLORER_URL}/transaction`,
  };
}

const DEFAULT_CONFIG = getConfig();

export function useGlobalConfig(): GlobalConfig {
  return DEFAULT_CONFIG;
}
