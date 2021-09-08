import { CkitInitOptions, CkitProvider, predefined, UnipassWallet } from '@ckitjs/ckit';
import { useLocalStorage } from '@rehooks/local-storage';
import { RpcClient } from '@sudt-faucet/commons';
import { useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';

const CLAIM_SECRET_PARAM_KEY = 'claim_secret';

function getConfig(): { ckitConfig: CkitInitOptions; mercuryUrl: string; ckbRpcUrl: string; unipassUrl: string } {
  const network = process.env.NETWORK;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ckitConfig = network === 'Lina' ? (predefined.Lina as CkitInitOptions) : predefined.Aggron;

  return {
    ckitConfig,
    ckbRpcUrl: process.env.MERCURY_URL ?? 'https://testnet.ckb.dev/rpc',
    mercuryUrl: process.env.RPC_URL ?? 'https://testnet.ckb.dev/indexer',
    unipassUrl: process.env.UNIPASS_URL ?? 'https://unipass.xyz',
  };
}

export const ClaimContainer = createContainer(() => {
  const [config] = useLocalStorage('config', getConfig());
  const [claimSecret, setClaimSecret, clearClaimSecret] = useLocalStorage('claim_secret');
  const [provider, setProvider] = useState<CkitProvider>();
  const [wallet, setWallet] = useState<UnipassWallet>();
  const [address, setAddress] = useState<string>();

  const client = useMemo(() => new RpcClient(), []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search.slice(1));

    const secret = searchParams.get(CLAIM_SECRET_PARAM_KEY);
    if (!secret) return;

    searchParams.delete(CLAIM_SECRET_PARAM_KEY);

    const { pathname, host, protocol } = window.location;

    const qs = searchParams.toString();
    const newUrl = `${protocol}//${host}${pathname}${qs ? `?${qs}` : ''}`;

    window.history.replaceState({ path: newUrl }, '', newUrl);
    setClaimSecret(secret);
  }, [setClaimSecret]);

  useEffect(() => {
    void (async () => {
      const provider = new CkitProvider(config.mercuryUrl, config.ckbRpcUrl);
      await provider.init(config.ckitConfig);

      const wallet = new UnipassWallet(provider);

      wallet.on('signerChanged', (signer) => Promise.resolve(signer.getAddress()).then(setAddress));

      setProvider(provider);
      setWallet(wallet);
    })();
  }, [config.ckbRpcUrl, config.ckitConfig, config.mercuryUrl]);

  useEffect(() => {
    if (!wallet) return;

    const adapter = new UnipassWallet.UnipassRedirectAdapter({ host: config.unipassUrl });
    if (adapter.getLoginDataFromCache() || adapter.hasLoginInfo()) wallet.connect();
  }, [wallet, config.unipassUrl]);

  return { address, wallet, provider, client, claimSecret, clearClaimSecret };
});
