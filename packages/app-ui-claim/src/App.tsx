import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GlobalConfigContainer, ProviderContainer, WalletContainer } from './containers';
import Cliamer from './pages/cliamer';
import './App.less';

const AppEntry: React.FC = ({ children }) => {
  return (
    <GlobalConfigContainer.Provider>
      <ProviderContainer.Provider>
        <WalletContainer.Provider>{children}</WalletContainer.Provider>
      </ProviderContainer.Provider>
    </GlobalConfigContainer.Provider>
  );
};

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <AppEntry>
      <QueryClientProvider client={queryClient}>
        <Cliamer />
      </QueryClientProvider>
    </AppEntry>
  );
};

export default App;
