import { Result, Spin } from 'antd';
import React, { useMemo } from 'react';
import { ClaimContainer } from '../ClaimContainer';
import Claim from './claim';
import Header from './header';
import Login from './login';

const Claimer: React.FC = () => {
  const { wallet, address, claimSecret } = ClaimContainer.useContainer();

  const view = useMemo(() => {
    if (!wallet) return null;

    if (!claimSecret) {
      return (
        <Result
          status="error"
          title="No Claim Secret Found"
          extra="Please click the claim link to reach this site, the claim needed a claim secret"
        />
      );
    }

    if (address) return <Claim address={address} claimSecret={claimSecret} />;
    return <Login />;
  }, [address, claimSecret, wallet]);

  if (!wallet) return <Spin />;

  return (
    <div className="app">
      <Header title="UDT Claimer" />
      {view}
    </div>
  );
};

export default Claimer;
