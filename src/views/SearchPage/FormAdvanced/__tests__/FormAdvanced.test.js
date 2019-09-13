import React from 'react';
import { render, shallow, mount } from 'enzyme';
import {
  resetDom,
  setupDom
} from '../../../../utilities/testHelpers';
import FormAdvanced from '../FormAdvanced';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <FormAdvanced {...props} />
  );
  return component;
};

describe('FormAdvanced', () => {
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
