import React from 'react';
import { render, } from 'enzyme';
import Fieldset from '../Fieldset';

const defaultProps = {
  id: 'mockId',
  legend: 'Mock Legend',
  name: 'mockName',
};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <Fieldset {...props}>
      <div>
        <input id="truth" value="truth" readOnly />
        <label htmlFor="truth">Sojourner Truth</label>
        <input type="checkbox" id="douglass" value="douglass" readOnly />
        <label htmlFor="douglass">Frederick Douglass</label>
      </div>
    </Fieldset>
  );
  return component;
};

describe('Fieldset', () => {
  describe('Render', () => {
    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });

    it('renders the legend', () => {
      const component = setup(render, defaultProps);
      expect(component.find('legend').text()).toMatch('Mock Legend');
    });

  });
});
