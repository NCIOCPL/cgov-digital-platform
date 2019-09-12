import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { history } from './services/history.service';
import './index.css';
import App from './App';

ReactDOM.render(
  <Router history={history}>
    <App />
  </Router>,
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