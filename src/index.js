import './polyfills/array_fill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Router } from 'react-router-dom';
import { history } from './services/history.service';
import * as reducers from './store/reducers';
import './index.css';
import App from './App';

const store = createStore(
  combineReducers(reducers),
  composeWithDevTools()
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);

// The following lets us run the app in dev not in situ as would normally be the case.
if (process.env.NODE_ENV !== 'production') {
  try{
    import('./__nci-dev__common.css');
  }
  catch(err){
    console.log("Can't find common.css file")
  }
}