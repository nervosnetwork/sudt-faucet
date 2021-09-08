import { CkitProvider, RcSupplyLockHelper, SudtInfo, utils } from '@ckitjs/ckit';
import { useQuery, UseQueryResult } from 'react-query';
import { ProviderContainer } from '../containers';
import { useRcSigner } from './useSigner';

export function useProvider(): CkitProvider {
  return utils.nonNullable(ProviderContainer.useContainer());
}

export function useRcHelper(): RcSupplyLockHelper {
  const provider = useProvider();

  return new RcSupplyLockHelper(provider.mercury, {
    rcLock: provider.newScriptTemplate('RC_LOCK'),
    sudtType: provider.newScriptTemplate('SUDT'),
  });
}

export function useListRcSupplyLockUdtQuery(udtId?: string): UseQueryResult<SudtInfo[]> {
  const helper = useRcHelper();
  const { rcIdentity } = useRcSigner();

  return useQuery(['listCreatedSudt', { rcIdentity, udtId }], () => {
    return helper.listCreatedSudt({ rcIdentity, udtId });
  });
}
