import React from 'react';
import { render, shallow, mount } from 'enzyme';
import {
  resetDom,
  setupDom
} from '../../../utilities/testHelpers';
import ResultsPage from '../ResultsPage';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <ResultsPage {...props} />
  );
  return component;
};

describe('ResultsPage', () => {
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
