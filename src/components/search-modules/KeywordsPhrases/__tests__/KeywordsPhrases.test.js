import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import KeywordsPhrases from '../KeywordsPhrases';

const mockStore = configureMockStore();

const defaultProps = {};

const initialState = {
  form: {
    q: ''
  }
}

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <KeywordsPhrases {...props} />
    </Provider>
  );
  return component;
};

describe('KeywordsPhrases', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
