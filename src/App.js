import React, { Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import './styles/main.scss';

import SearchPage from './views/SearchPage';
import ResultsPage from './views/ResultsPage';
import TrialDescriptionPage from './views/TrialDescriptionPage';

function App() {
  return (
    <Fragment>
      <Switch>
        <Redirect exact from="/" to="/about-cancer/treatment/clinical-trials/search" />
        <Route
          exact
          path="/about-cancer/treatment/clinical-trials/search/r"
          component={ResultsPage}
        />
        <Route exact path="/about-cancer/treatment/clinical-trials/search/v" component={TrialDescriptionPage} />
        <Route exact path="/about-cancer/treatment/clinical-trials/search/advanced" render={() => <SearchPage formInit="advanced" />} />
        <Route path="/about-cancer/treatment/clinical-trials/search" component={SearchPage} />
      </Switch>
    </Fragment>
  );
}

export default App;
