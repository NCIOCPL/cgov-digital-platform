import React from 'react';
import { render } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import TrialDescriptionPage from '../TrialDescriptionPage';

const defaultProps = {};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <MemoryRouter>
      <TrialDescriptionPage {...props} />
    </MemoryRouter>
  );
  return component;
};

describe('TrialDescriptionPage', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });
});
