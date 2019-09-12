import React from 'react';
import { render, shallow, mount } from 'enzyme';
import { resetDom, setupDom } from '../../../../utilities/testHelpers';
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
    let component = null;

    afterEach(() => {
      resetDom();
    });

    it('renders without error', () => {
      component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });

    it('renders the legend', () => {
      component = setup(render, defaultProps);
      expect(component.find('legend').text()).toBe('Mock Legend');
    });

  });
});
