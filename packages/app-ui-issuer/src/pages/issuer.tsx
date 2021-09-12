import { Button, Spin } from 'antd';
import React, { useEffect } from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { usePrevious } from 'react-use';
import Header from '../components/header';
import { WalletContainer } from '../containers';
import { useLoginStatus } from '../hooks';
import CreateToken from './createToken';
import IssueToken from './issueToken';
import Login from './login';
import TokenCharge from './tokenCharge';
import TokenDetail from './tokenDetail';
import TokenList from './tokenList';
import TokenManagement from './tokenManagement';

export const Issuer: React.FC = () => {
  const wallet = WalletContainer.useContainer();
  const prevStage = usePrevious(wallet.stage);
  const loginStatus = useLoginStatus();
  useEffect(() => {
    if (prevStage === 'uninitialized' && wallet.stage === 'readyToConnect') {
      wallet.connect();
    }
  }, [prevStage, wallet]);

  if (wallet.stage !== 'readyToSign') {
    return <Spin tip="App is initialing..." />;
  }

  return (
    <div className="app">
      <Router>
        <Header title={`UDT Issuer`} />
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/token-list">{loginStatus ? <TokenList /> : <Redirect to="/login" />}</Route>
          <Route path="/create-token">{loginStatus ? <CreateToken /> : <Redirect to="/login" />}</Route>
          <Route path="/token-detail/:udtId">{loginStatus ? <TokenDetail /> : <Redirect to="/login" />}</Route>
          <Route path="/issue-token/:udtId">{loginStatus ? <IssueToken /> : <Redirect to="/login" />}</Route>
          <Route path="/token-management/:udtId">{loginStatus ? <TokenManagement /> : <Redirect to="/login" />}</Route>
          <Route path="/token-charge/:udtId">{loginStatus ? <TokenCharge /> : <Redirect to="/login" />}</Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
