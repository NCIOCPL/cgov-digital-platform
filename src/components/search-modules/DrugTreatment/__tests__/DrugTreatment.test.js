import React from 'react';
import { render } from 'enzyme';
import DrugTreatment from '../DrugTreatment';

const defaultProps = {
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <DrugTreatment {...props} />
  );
  return component;
};

describe('DrugTreatment', () => {
  describe('Render', () => {

    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

});
