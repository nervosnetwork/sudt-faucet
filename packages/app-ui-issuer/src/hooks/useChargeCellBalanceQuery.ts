import { helpers, utils } from '@ckitjs/ckit';
import { useQuery, UseQueryResult } from 'react-query';
import { useListRcSupplyLockUdtQuery, useProvider, useRcHelper } from './useProvider';
import { useRcSigner } from './useSigner';

type ChargeCellStatus = { udt: { amount: string; symbol: string; decimals: number }; ckb: { amount: string } };

export function useChargeCellBalanceQuery(udtId: string): UseQueryResult<ChargeCellStatus> {
  const { address, rcIdentity } = useRcSigner();
  const provider = useProvider();
  const helper = useRcHelper();
  const { data } = useListRcSupplyLockUdtQuery(udtId);

  const udtInfo = data?.[0];

  return useQuery<ChargeCellStatus>(
    ['queryCkbBalance', { udtId }],
    async () => {
      utils.asserts(udtInfo);

      const udtCells = await provider.collectUdtCells(address, helper.newSudtScript({ rcIdentity, udtId }), '0');
      const ckbBalance = await provider.getCkbLiveCellsBalance(address);

      if (!udtCells[0]) {
        return {
          udt: { amount: '0x0', decimals: udtInfo.decimals, symbol: udtInfo.symbol },
          ckb: { amount: ckbBalance },
        };
      }

      const udtBalance = await provider.getUdtBalance(address, helper.newSudtScript({ rcIdentity, udtId }));

      return {
        udt: { amount: udtBalance, decimals: udtInfo.decimals, symbol: udtInfo.symbol },
        ckb: { amount: helpers.CkbAmount.fromShannon(udtCells[0].output.capacity).plus(ckbBalance).toHex() },
      };
    },
    { enabled: !!udtInfo },
  );
}
