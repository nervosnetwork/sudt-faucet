import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.less';
import { ClaimContainer } from './ClaimContainer';
import Cliamer from './pages/cliamer';

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <ClaimContainer.Provider>
      <QueryClientProvider client={queryClient}>
        <Cliamer />
      </QueryClientProvider>
    </ClaimContainer.Provider>
  );
};

export default App;
