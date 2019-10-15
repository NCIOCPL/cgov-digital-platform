import './polyfills/array_fill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Router } from 'react-router-dom';
import { history } from './services/history.service';
import * as reducers from './store/reducers';
import {
  loadStateFromSessionStorage,
  saveStatetoSessionStorage,
} from './utilities/utilities';
import './index.css';
import createCTSMiddleware from './middleware/CTSMiddleware';
import cacheMiddleware from './middleware/cacheMiddleware';
import { ClinicalTrialsServiceFactory } from '@nciocpl/clinical-trials-search-client.js';

import App from './App';

const initialize = ({
  appId = '@@/DEFAULT_CTS_APP_ID',
  useSessionStorage = true,
  rootId = 'NCI-CTS-root',
  services = {},
  language = 'en',
} = {}) => {

  let cachedState;
  
  if (process.env.NODE_ENV !== 'development' && useSessionStorage === true) {
    cachedState = loadStateFromSessionStorage(appId);
  }
  // Set up middleware chain for redux dispatch.
  // const historyMiddleware = createHistoryMiddleware(history);

  const ctsMiddleware = createCTSMiddleware(services);

  const store = createStore(
    combineReducers(reducers),
    cachedState,
    composeWithDevTools(applyMiddleware(cacheMiddleware, ctsMiddleware))
  );

  // With the store now created, we want to subscribe to updates.
  // This implementation updates session storage backup on each store change.
  // If for some reason that proves too heavy, it's simple enough to scope to
  // only specific changes (like the url);
  //TODO: Only in prod?
  if (useSessionStorage === true) {
    const saveDesiredStateToSessionStorage = () => {
      const state = store.getState();
      // const { form, ...state } = allState;
      // saveStatetoSessionStorage({
      //   state,
      //   appId,
      // });
    };

    store.subscribe(saveDesiredStateToSessionStorage);
  }
  const appRootDOMNode = document.getElementById(rootId);
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>,
    appRootDOMNode
  );
  return appRootDOMNode;
};

// The following lets us run the app in dev not in situ as would normally be the case.
if (process.env.NODE_ENV !== 'production') {
  try {
    import('./__nci-dev__common.css');
  } catch (err) {
    console.log("Can't find common.css file");
  }
  const rootId = 'NCI-CTS-root';
  const ctsSearch = () => {
    const hostName = 'clinicaltrialsapi.cancer.gov';
    const service = ClinicalTrialsServiceFactory.create(hostName);
    return service;
  };

  initialize({
    rootId,
    services: {
      ctsSearch,
    },
    language: 'en',
  });
}

export default initialize;
