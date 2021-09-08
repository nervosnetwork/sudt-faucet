import { CkitProvider } from '@ckitjs/ckit';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { GlobalConfigContainer } from './GlobalConfigContainer';

function useCkitProvider(): CkitProvider | undefined {
  const [config] = GlobalConfigContainer.useContainer();
  const [provider, setProvider] = useState<CkitProvider>();

  useEffect(() => {
    const provider = new CkitProvider(config.mercuryRPC, config.ckbRPC);
    void provider.init(config.ckitConfig).then(() => setProvider(provider));
  }, [config]);

  return provider;
}

export const ProviderContainer = createContainer(useCkitProvider);
