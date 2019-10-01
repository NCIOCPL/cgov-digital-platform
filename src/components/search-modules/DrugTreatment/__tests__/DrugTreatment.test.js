import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import DrugTreatment from '../DrugTreatment';

const mockStore = configureMockStore();

const defaultProps = {};

const initialState = {
  cache: {
    drugs: [],
    treatments: [],
  },
  form: {
    drugs: [],
    treatments: []
  }
};

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <DrugTreatment {...props} />
    </Provider>
  );
  return component;
};

describe('DrugTreatment', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
