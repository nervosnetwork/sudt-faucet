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
          {routeList.map((item) => (
            <Route path={item.path} key={item.path}>
              <WapperComponent title={item.title}>
                <item.component></item.component>
              </WapperComponent>
            </Route>
          ))}
        </Switch>
      </Router>
    </div>
  );
};
