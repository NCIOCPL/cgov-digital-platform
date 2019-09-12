import React from 'react';
import { renderWithRouter } from './utilities/testHelpers.js';
import App from './App';
import { italic } from 'ansi-colors';
const defaultProps = {};


// mock page templates instead of using real components
jest.mock('./views/ResultsPage', () => () => (
  <div id="mockResultsPage">mockResultsPage</div>
));
jest.mock('./views/SearchPage', () => () => (
  <div id="mockSearchPage">mockSearchPage</div>
));

describe('App', () => {
  describe('Router', () => {
    it('routes to search page by default', () => {
      const {container, getByText} = renderWithRouter(<App />);
      expect(getByText('mockSearchPage')).toBeTruthy();
      expect(container).toMatchSnapshot();
    });

    it('routes to results when given route /r', () => {
      const {container, getByText} = renderWithRouter(<App />, {
        route: '/r'
      });
      expect(getByText('mockResultsPage')).toBeTruthy();
      expect(container).toMatchSnapshot();
    });
  });
});
