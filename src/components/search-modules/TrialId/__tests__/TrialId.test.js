import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from 'enzyme';
import TrialId from '../TrialId';

const mockStore = configureMockStore();

const defaultProps = {};

const setup = (enzymeMethod = render, props = {}, initialState = {}) => {
  const store = mockStore(initialState);
  const component = enzymeMethod(
    <Provider store={store}>
      <TrialId {...props} />
    </Provider>
  );
  return component;
};

describe('TrialId', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps, {
        form: {
          tid: ''
        }
      });
      expect(component).toMatchSnapshot();
    });
  });
});
