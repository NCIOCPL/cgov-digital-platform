import React from 'react';
import { render, shallow, mount } from 'enzyme';
import {
  resetDom,
  setupDom
} from '../../../../utilities/testHelpers';
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
