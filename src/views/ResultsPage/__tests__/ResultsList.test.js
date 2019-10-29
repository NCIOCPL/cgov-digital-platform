import React from 'react';
import { render } from 'enzyme';
import ResultsList from '../ResultsList';

const defaultProps = {
  selectAllControlHook: jest.fn()
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <ResultsList {...props} />
  );
  return component;
};

describe('ResultsList', () => {
  describe('Render', () => {
    it('should match snapshot', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
