import React, { Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import './styles/main.scss';

import SearchPage from './views/SearchPage';
import ResultsPage from './views/ResultsPage';

function App() {
  return (
    <Fragment>
      <Switch>
        <Redirect exact from="/" to="/search" />
        <Route path="/search" component={SearchPage} />
        <Route path="/r" component={ResultsPage} />
      </Switch>
    </Fragment>
  );
}

export default App;
