import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Issuer } from './issuer';
import './App.less';

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Issuer />
    </QueryClientProvider>
  );
};

export default App;
