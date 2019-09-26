import React from 'react';
import { render } from 'enzyme';
import { Provider } from 'react-redux';
import SearchPage from '../SearchPage';

const defaultProps = {
  form: 'basic'
}

const store = {}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <Provider store={store}><SearchPage {...props} /></Provider>
  );
  return component;
};

describe('SearchPage', () => {
  describe('Render', () => {

    it.skip('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
