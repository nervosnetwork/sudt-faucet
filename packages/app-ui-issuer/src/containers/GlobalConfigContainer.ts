import { CkitInitOptions, predefined } from '@ckitjs/ckit';
import { useLocalStorage } from '@rehooks/local-storage';
import { createContainer } from 'unstated-next';

export interface LocalConfig {
  ckitConfig: CkitInitOptions;
  mercuryRPC: string;
  ckbRPC: string;
  nervosExploreTxUrlPrefix: string;
  nervosExploreAddressUrlPrefix: string;
  nervosExploreSudtUrlPrefix: string;
}

export const initialValue: LocalConfig = {
  ckitConfig: predefined.Aggron,
  mercuryRPC: 'https://testnet.ckb.dev/indexer',
  ckbRPC: 'https://testnet.ckb.dev/rpc',
  nervosExploreTxUrlPrefix: 'https://explorer.nervos.org/aggron/transaction/',
  nervosExploreAddressUrlPrefix: 'https://explorer.nervos.org/aggron/address/',
  nervosExploreSudtUrlPrefix: 'https://explorer.nervos.org/aggron/sudt/',
};

function useGlobalConfig() {
  return useLocalStorage<LocalConfig>('localConfig', initialValue);
}

export const GlobalConfigContainer = createContainer(useGlobalConfig);
