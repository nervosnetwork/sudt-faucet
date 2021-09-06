import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from '../components/header';
import { routeList } from '../router';
import CreateToken from './createToken';
import IssueToken from './issueToken';
import Login from './login';
import TokenCharge from './tokenCharge';
import TokenDetail from './tokenDetail';
import TokenList from './tokenList';
import TokenManagement from './tokenManagement';
import { WapperComponent } from './wapperComponent';

export const Issuer: React.FC = () => {
  return (
    <div className="app">
      <Router>
        <Switch>
          {/* {routeList.map((item) => (
            <Route path={item.path} key={item.path}>
              <WapperComponent title={item.title}>{item.component}</WapperComponent>
            </Route>
          ))} */}
          <Route path="/login">
            <WapperComponent title="Token Issuer">
              <Login />
            </WapperComponent>
          </Route>
          <Route path="/token-list">
            <WapperComponent title="Token Issuer">
              <TokenList />
            </WapperComponent>
          </Route>
          <Route path="/create-token">
            <WapperComponent title="Token Issuer">
              <CreateToken />
            </WapperComponent>
          </Route>
          <Route path="/token-detail">
            <WapperComponent title="Token Issuer">
              <TokenDetail />
            </WapperComponent>
          </Route>
          <Route path="/issue-token">
            <WapperComponent title="Token Issuer">
              <IssueToken />
            </WapperComponent>
          </Route>
          <Route path="/token-management">
            <WapperComponent title="Token Issuer">
              <TokenManagement />
            </WapperComponent>
          </Route>
          <Route path="/token-charge">
            <WapperComponent title="Token Issuer">
              <TokenCharge />
            </WapperComponent>
          </Route>
          <Route path="/">
            <WapperComponent title="Token Issuer">
              <Login />
            </WapperComponent>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
