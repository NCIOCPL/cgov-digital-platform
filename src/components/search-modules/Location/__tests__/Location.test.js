import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import Location from '../Location';

const mockStore = configureMockStore();

const defaultProps = {};

const initialState = {
  form: {
    z: '',
    zp: '',
    lcnty: '',
    lcty: '',
    lst: '',
    hos: '',
  },
  cache: {
    countries: [],
  },
};

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <Location {...props} />
    </Provider>
  );
  return component;
};

describe('Location', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
