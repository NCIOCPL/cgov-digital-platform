import React from 'react';
import { render, shallow, mount } from 'enzyme';
import {
  resetDom,
  setupDom
} from '../../../../utilities/testHelpers';
import ResultsItem from '../ResultsItem';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <ResultsItem {...props} />
  );
  return component;
};

describe('ResultsItem', () => {
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
