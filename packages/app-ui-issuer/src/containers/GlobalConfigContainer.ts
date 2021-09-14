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

const NERVOS_EXPLORER_URL = env.readAsStr('NERVOS_EXPLORER_URL', 'https://explorer.nervos.org/aggron');

export const initialValue: LocalConfig = {
  ckitConfig: predefined[env.readAsStr('NETWORK', 'Aggron') === 'Lina' ? 'Lina' : 'Aggron'],
  mercuryRPC: env.readAsStr('CKB_INDEXER_URL', 'https://testnet.ckb.dev/indexer'),
  ckbRPC: env.readAsStr('CKB_INDEXER_URL', 'https://testnet.ckb.dev/rpc'),
  nervosExploreTxUrlPrefix: `${NERVOS_EXPLORER_URL}/transaction/`,
  nervosExploreAddressUrlPrefix: `${NERVOS_EXPLORER_URL}/address/`,
  nervosExploreSudtUrlPrefix: `${NERVOS_EXPLORER_URL}/sudt/`,
};

function useGlobalConfig() {
  return useLocalStorage<LocalConfig>('localConfig', initialValue);
}

export const GlobalConfigContainer = createContainer(useGlobalConfig);
