import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from '../components/header';
import CreateToken from './createToken';
import IssueToken from './issueToken';
import Login from './login';
import TokenCharge from './tokenCharge';
import TokenDetail from './tokenDetail';
import TokenList from './tokenList';
import TokenManagement from './tokenManagement';

export const Issuer: React.FC = () => {
  return (
    <div className="app">
      <Router>
        <Header />
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/token-list">
            <TokenList />
          </Route>
          <Route path="/create-token">
            <CreateToken />
          </Route>
          <Route path="/token-detail">
            <TokenDetail />
          </Route>
          <Route path="/issue-token">
            <IssueToken />
          </Route>
          <Route path="/token-management">
            <TokenManagement />
          </Route>
          <Route path="/token-charge">
            <TokenCharge />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
