import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import TrialType from '../TrialType';

const mockStore = configureMockStore()

const defaultProps = {};

const initialState = {
  form: {
    hv: false
  }
}

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <TrialType {...props} />
    </Provider>
  );
  return component;
};

describe('TrialType', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, initialState);
      expect(component).toMatchSnapshot();
    });
  });
});
