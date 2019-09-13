import React from 'react';
import { render} from 'enzyme';
import {
  resetDom,
  setupDom
} from '../../../../utilities/testHelpers';
import FormBasic from '../FormBasic';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <FormBasic {...props} />
  );
  return component;
};

describe('FormBasic', () => {
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
