import { ClaimHistory } from '@sudt-faucet/commons';
import { useQuery, UseQueryResult } from 'react-query';
import { ClaimContainer } from '../ClaimContainer';
import { useClaimSecret } from './useClaimSecret';

export function useClaimStatus(): UseQueryResult<ClaimHistory> {
  const { client } = ClaimContainer.useContainer();
  const [secret] = useClaimSecret();
  return useQuery(
    ['get_claim_history', { secret }],
    () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return client.get_claim_history({ secret: secret! }).then((res) => res.history);
    },
    {
      enabled: !!secret,
      refetchInterval: 5000,
    },
  );
}
