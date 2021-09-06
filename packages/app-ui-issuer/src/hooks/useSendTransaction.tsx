import { Modal } from 'antd';
import React from 'react';
import { useMutation, UseMutationResult } from 'react-query';
import { GlobalConfigContainer } from '../containers';
import { useProvider } from './useProvider';
import { useRcSigner } from './useSigner';

export function useSendTransaction(): UseMutationResult<string> {
  const provider = useProvider();
  const signer = useRcSigner();
  const [config] = GlobalConfigContainer.useContainer();

  return useMutation(
    ['send-tx'],
    async (unsigned: unknown) => {
      return provider.sendTransaction(await signer.signTransaction(unsigned));
    },
    {
      onSuccess(txHash) {
        Modal.success({
          title: 'Tx sent',
          content: (
            <p>
              The transaction was sent, check it in&nbsp;
              <a href={config.nervosExploreTxUrlPrefix + txHash} target="_blank" rel="noreferrer">
                explorer
              </a>
              <details>
                <summary>transaction id</summary>
                {txHash}
              </details>
            </p>
          ),
        });
      },
      onError() {
        // TODO add content
        Modal.error({
          title: 'Tx sent error',
        });
      },
    },
  );
}
