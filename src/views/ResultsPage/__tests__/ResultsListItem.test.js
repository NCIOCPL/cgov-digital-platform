import React from 'react';
import { render, mount } from 'enzyme';
import ResultsListItem from '../ResultsListItem';

const defaultProps = {
  item: {
    title: 'Universal homogeneous pricing structure',
    url:
      'http://a8.net/proin/eu/mi/nulla/ac/enim/in.xml?nibh=elementum&in=in&quis=hac&justo=habitasse&maecenas=platea&rhoncus=dictumst&aliquam=morbi&lacus=vestibulum&morbi=velit&quis=id&tortor=pretium&id=iaculis',
    status: false,
    age: 71,
    gender: 'Male',
    location: '44',
  },
  isChecked: false,
  onCheckChange: jest.fn()
};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(<ResultsListItem {...props} />);
  return component;
};

describe('ResultsListItem', () => {
  describe('Render', () => {
    it('should match snapshot', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });
});
