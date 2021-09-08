import { RcIdentity, RcPwSigner } from '@ckitjs/ckit';
import { useMemo } from 'react';
import { WalletContainer } from '../containers';

interface AppSigner {
  address: string;
  signTransaction: (tx: unknown) => ReturnType<RcPwSigner['seal']>;
  rcIdentity: RcIdentity;
}

export function useRcSigner(): AppSigner {
  const wallet = WalletContainer.useContainer();

  if (wallet.stage !== 'readyToSign') throw new Error('useSigner must be call after wallet.stage is readyToSign');

  return useMemo(() => {
    return {
      address: wallet.address,
      rcIdentity: wallet.signer.getRcIdentity(),
      signTransaction(tx) {
        return wallet.signer.seal(tx);
      },
    };
  }, [wallet.address, wallet.signer]);
}
