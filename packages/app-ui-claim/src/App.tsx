import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.less';
import { ClaimContainer } from './ClaimContainer';
import Claimer from './pages/claimer';

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ClaimContainer.Provider>
        <Claimer />
      </ClaimContainer.Provider>
    </QueryClientProvider>
  );
};

export default App;
