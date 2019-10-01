import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import Age from '../Age';

const mockStore = configureMockStore();

const defaultProps = {};

const initialState = {
  form: {
    a: '',
  },
};

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <Age {...props} />
    </Provider>
  );
  return component;
};

describe('Age', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
