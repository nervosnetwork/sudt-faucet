import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Claim from './claim';
import Header from './header';
import Login from './login';
import Success from './success';

const Claimer: React.FC = () => {
  return (
    <div className="app">
      <Header title="UDT Cliamer" />
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/claim">
            <Claim />
          </Route>
          <Route path="/scccess">
            <Success />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default Claimer;
