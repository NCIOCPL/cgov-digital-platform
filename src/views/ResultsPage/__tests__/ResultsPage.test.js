import React from 'react';
import { render } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import ResultsPage from '../ResultsPage';

const defaultProps = {};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <MemoryRouter>
      <ResultsPage {...props} />
    </MemoryRouter>
  );
  return component;
};

describe('ResultsPage', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });
});
