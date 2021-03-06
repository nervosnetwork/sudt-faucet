import { CkitInitOptions, predefined } from '@ckitjs/ckit';
import { useLocalStorage } from '@rehooks/local-storage';
import { env } from '@sudt-faucet/commons';
import { createContainer } from 'unstated-next';

export interface LocalConfig {
  ckitConfig: CkitInitOptions;
  mercuryRPC: string;
  ckbRPC: string;
  nervosExploreTxUrlPrefix: string;
  nervosExploreAddressUrlPrefix: string;
  nervosExploreSudtUrlPrefix: string;
}

const NERVOS_EXPLORER_URL = env.readAsStr('REACT_APP_NERVOS_EXPLORER_URL');

export const initialValue: LocalConfig = {
  ckitConfig: predefined[env.readAsStr('REACT_APP_NETWORK') === 'Lina' ? 'Lina' : 'Aggron'],
  mercuryRPC: env.readAsStr('REACT_APP_CKB_INDEXER_URL'),
  ckbRPC: env.readAsStr('REACT_APP_CKB_NODE_URL'),
  nervosExploreTxUrlPrefix: `${NERVOS_EXPLORER_URL}/transaction/`,
  nervosExploreAddressUrlPrefix: `${NERVOS_EXPLORER_URL}/address/`,
  nervosExploreSudtUrlPrefix: `${NERVOS_EXPLORER_URL}/sudt/`,
};

function useGlobalConfig() {
  return useLocalStorage<LocalConfig>('localConfig', initialValue);
}

export const GlobalConfigContainer = createContainer(useGlobalConfig);
