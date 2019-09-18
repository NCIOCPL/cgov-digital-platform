import React from 'react';
import { render } from 'enzyme';
import CancerTypeCondition from '../CancerTypeCondition';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <CancerTypeCondition {...props} />
  );
  return component;
};

describe('CancerTypeCondition', () => {
  describe('Render', () => {

    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
