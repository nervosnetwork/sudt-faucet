import { CkitProvider, UnipassWallet } from '@ckitjs/ckit';
import { RpcClient } from '@sudt-faucet/commons';
import { useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useClaimSecret } from './hooks/useClaimSecret';
import { useGlobalConfig } from './hooks/useGlobalConfig';

export const ClaimContainer = createContainer(() => {
  const config = useGlobalConfig();
  const [claimSecret, clearClaimSecret] = useClaimSecret();
  const [provider, setProvider] = useState<CkitProvider>();
  const [wallet, setWallet] = useState<UnipassWallet>();
  const [address, setAddress] = useState<string>();

  const client = useMemo(() => new RpcClient(), []);

  useEffect(() => {
    void (async () => {
      const provider = new CkitProvider(config.mercuryUrl, config.ckbRpcUrl);
      await provider.init(config.ckitConfig);

      const wallet = new UnipassWallet(provider, { host: config.unipassUrl, loginDataCacheKey: '__unipass__' });

      wallet.on('signerChanged', (signer) => Promise.resolve(signer.getAddress()).then(setAddress));

      const adapter = wallet.adapter;
      if (adapter.getLoginDataFromCache() || adapter.hasLoginInfo()) wallet.connect();

      setProvider(provider);
      setWallet(wallet);
    })();
  }, [config.ckitConfig, config.ckbRpcUrl, config.mercuryUrl, config.unipassUrl]);

  return { address, wallet, provider, client, claimSecret, clearClaimSecret };
});
