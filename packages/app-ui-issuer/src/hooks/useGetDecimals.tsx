import { useListRcSupplyLockUdtQuery } from '../hooks';

export function useGetDecimals(udtId: string): number {
  const { data: udts } = useListRcSupplyLockUdtQuery(udtId);
  const foundUdtInfo = udts?.[0];
  return foundUdtInfo?.decimals || 0;
}
