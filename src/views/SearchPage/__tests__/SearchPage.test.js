import React from 'react';
import { render, shallow, mount } from 'enzyme';
import {
  resetDom,
  setupDom
} from '../../../utilities/testHelpers';
import SearchPage from '../SearchPage';

const defaultProps = {
  form: 'basic'
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <SearchPage {...props} />
  );
  return component;
};

describe('SearchPage', () => {
  describe('Render', () => {
    let component = null;

    afterEach(() => {
      resetDom();
    });

    it('renders without error', () => {
      component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
