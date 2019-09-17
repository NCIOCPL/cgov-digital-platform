import React from 'react';
import { render } from 'enzyme';
import TrialId from '../TrialId';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <TrialId {...props} />
  );
  return component;
};

describe('TrialId', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
