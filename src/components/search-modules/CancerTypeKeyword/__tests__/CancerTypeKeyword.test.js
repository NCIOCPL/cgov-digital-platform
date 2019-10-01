import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import CancerTypeKeyword from '../CancerTypeKeyword';

const mockStore = configureMockStore();

const defaultProps = {};

const initialState = {
  cache: {
    diseases: [],
  },
};

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <CancerTypeKeyword {...props} />
    </Provider>
  );
  return component;
};
describe('CancerTypeKeyword', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
