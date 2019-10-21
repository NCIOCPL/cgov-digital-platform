import React from 'react';
import { render } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import ProtocolPage from '../ProtocolPage';

const defaultProps = {};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <MemoryRouter>
      <ProtocolPage {...props} />
    </MemoryRouter>
  );
  return component;
};

describe('ProtocolPage', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });
});
