import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import CancerTypeCondition from '../CancerTypeCondition';

const mockStore = configureMockStore();

const defaultProps = {};

const initialState = {
  form: {
    subtypes: [],
    stages: [],
    findings: [],
  },
  cache: {
    diseases: [],
    subtypes: [],
    stages: [],
    findings: [],
  },
};

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <CancerTypeCondition {...props} />
    </Provider>
  );
  return component;
};

describe('CancerTypeCondition', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
