import React from 'react';
import { render } from 'enzyme';
import LeadOrganization from '../LeadOrganization';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <LeadOrganization {...props} />
  );
  return component;
};

describe('LeadOrganization', () => {
  describe('Render', () => {

    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
