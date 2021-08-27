import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import CreateToken from './createToken';
import Header from './header';
import IssueToken from './issueToken';
import Login from './login';
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
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
