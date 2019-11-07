import React, { Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import './styles/main.scss';

import SearchPage from './views/SearchPage';
import ResultsPage from './views/ResultsPage';

import mockResults from './mocks/mock-results.json';

function App() {
  return (
    <Fragment>
      <Switch>
        <Redirect exact from="/" to="/about-cancer/treatment/clinical-trials/search" />
        <Route path="/about-cancer/treatment/clinical-trials/search" component={SearchPage} />
        <Route
          path="/about-cancer/treatment/clinical-trials/search/r"
          render={() => <ResultsPage results={mockResults} />}
        />
      </Switch>
    </Fragment>
  );
}

export default App;
