import './polyfills/array_fill';
//TODO: Remove this next import once done with Netlify.
import './__nci-dev__common.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Router } from 'react-router-dom';
import { history } from './services/history.service';
import * as reducers from './store/reducers';
import './index.css';
import createCTSMiddleware from './middleware/CTSMiddleware';
import { ClinicalTrialsServiceFactory } from '@nciocpl/clinical-trials-search-client.js';

import App from './App';

const initialize = ({
  appId = '@@/DEFAULT_SWS_APP_ID',
  rootId = 'NCI-search-results-root',
  services = {},
  language = 'en',
} = {}) => {
  // Set up middleware chain for redux dispatch.
  // const historyMiddleware = createHistoryMiddleware(history);
  const ctsMiddleware = createCTSMiddleware(services);

  const store = createStore(
    combineReducers(reducers),
    composeWithDevTools(applyMiddleware(ctsMiddleware))
  );

  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>,
    document.getElementById('root')
  );
};

// The following lets us run the app in dev not in situ as would normally be the case.
if (process.env.NODE_ENV !== 'production') {
  try{
    import('./__nci-dev__common.css');
  }
  catch(err){
    console.log("Can't find common.css file")
  }
  const rootId = 'NCI-search-results-root';
  const getDiseases = () => {
    const hostName = 'clinicaltrialsapi.cancer.gov';
    const service = ClinicalTrialsServiceFactory.create(hostName);
    return service.getDiseases;
  }

  const getTerms = () => {
    const hostName = 'clinicaltrialsapi.cancer.gov';
    const service = ClinicalTrialsServiceFactory.create(hostName);
    return service.getTerms;
  }

  const getInterventions = () => {
    const hostName = 'clinicaltrialsapi.cancer.gov';
    const service = ClinicalTrialsServiceFactory.create(hostName);
    return service.getInterventions;
  }

  initialize({
    rootId,
    services: {
      getDiseases,
      getTerms,
      getInterventions
    },
    language: 'en',
  });
}
