import React from 'react';
import { render } from 'enzyme';
import TrialInvestigators from '../TrialInvestigators';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <TrialInvestigators {...props} />
  );
  return component;
};

describe('TrialInvestigators', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
