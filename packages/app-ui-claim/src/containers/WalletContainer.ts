import { ConnectStatus, RcOwnerWallet, RcPwSigner } from '@ckitjs/ckit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ProviderContainer } from './CkitProviderContainer';

export interface UnreadyWallet {
  stage: 'uninitialized';
  connectStatus: 'disconnected';
  errorMessage: string | undefined;
}

export interface ReadyWallet {
  stage: 'readyToConnect';
  connectStatus: ConnectStatus;
  connect: () => void;
}

export interface ReadySigner {
  stage: 'readyToSign';
  connectStatus: 'connected';
  signer: RcPwSigner;
  address: string;
}

type AppWallet = UnreadyWallet | ReadyWallet | ReadySigner;

function useWallet(): AppWallet {
  const provider = ProviderContainer.useContainer();

  const [wallet, setWallet] = useState<RcOwnerWallet>();
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [signer, setSigner] = useState<RcPwSigner>();
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    if (!provider) return;

    const wallet = new RcOwnerWallet(provider);

    wallet.on('connectStatusChanged', (status) => {
      setErrorMessage(undefined);
      setConnectStatus(status);
    });

    wallet.on('error', (e: unknown) => {
      if (e instanceof Error) return setErrorMessage(e.message);
      if (typeof e === 'string') return setErrorMessage(e);
    });

    wallet.on('signerChanged', (signer) => setSigner(signer as RcPwSigner));

    setWallet(wallet);
  }, [provider]);

  const isReadyToConnect = useMemo(() => !!wallet, [wallet]);
  const isReadyToSign = useMemo(() => !!(signer && address), [signer, address]);

  const stage = useMemo(() => {
    if (isReadyToSign) return 'readyToSign';
    if (isReadyToConnect) return 'readyToConnect';
    return 'uninitialized';
  }, [isReadyToConnect, isReadyToSign]);

  useEffect(() => {
    if (!wallet) setErrorMessage(undefined);
  }, [wallet]);

  useEffect(() => {
    if (!signer) return setAddress(undefined);
    void Promise.resolve(signer.getAddress()).then(setAddress);
  }, [signer]);

  const connect = useCallback(() => {
    if (!isReadyToConnect || !wallet) {
      throw new Error('Wallet is not ready to connect, please check isReadyToConnect at first');
    }

    wallet.connect();
  }, [wallet, isReadyToConnect]);

  return {
    stage,
    isReadyToConnect,
    isReadyToSign,
    connect,
    connectStatus,
    signer,
    address,
    errorMessage,
  } as AppWallet;
}

export const WalletContainer = createContainer(useWallet);
