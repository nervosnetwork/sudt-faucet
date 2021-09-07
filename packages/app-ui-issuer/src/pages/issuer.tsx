import React, { useEffect } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { usePrevious } from 'react-use';
import Header from '../components/header';
import { WalletContainer } from '../containers';
import CreateToken from './createToken';
import IssueToken from './issueToken';
import Login from './login';
import TokenDetail from './tokenDetail';
import TokenList from './tokenList';
import TokenManagement from './tokenManagement';

export const Issuer: React.FC = () => {
  const wallet = WalletContainer.useContainer();
  const prevStage = usePrevious(wallet.stage);

  useEffect(() => {
    if (prevStage === 'uninitialized' && wallet.stage === 'readyToConnect') {
      wallet.connect();
    }
  }, [prevStage, wallet]);

  return (
    <div className="app">
      <Router>
        <Header title="UDT Issuer" />
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/token-list">{wallet.stage === 'readyToSign' ? <TokenList /> : <Redirect to="/login" />}</Route>
          <Route path="/create-token">
            <CreateToken />
          </Route>
          <Route path="/token-detail/:udtId">
            <TokenDetail />
          </Route>
          <Route path="/issue-token/:udtId">
            <IssueToken />
          </Route>
          <Route path="/token-management/:udtId">
            <TokenManagement />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
