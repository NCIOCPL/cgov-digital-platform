import React from 'react';
import { shallow } from 'enzyme';
import InputLabel from '../InputLabel.jsx';

jest.unmock('../InputLabel.jsx');

describe('InputLabel', () => {
  let wrapper = null;
  const label = 'Label test';
  const htmlFor = 'htmlForTest';

  beforeEach(function() {
    wrapper = shallow(<InputLabel label={label} htmlFor={htmlFor} />);
  });

  it('renders without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('is defined', () => {
    expect(wrapper).toBeDefined();
  });

  it('renders the label text', () => {
    expect(wrapper.text()).toBe(label);
  });

  it('has an htmlFor attribute', () => {
    expect(wrapper.props().htmlFor).toBe(htmlFor);
  });

  it('has an id', () => {
    expect(wrapper.props().id).toBe(`${htmlFor}-label`);
  });

  it('accepts the required attribute', () => {
    wrapper = shallow(<InputLabel required label={label} htmlFor={htmlFor} />);
    expect(wrapper.hasClass('--required')).toBe(true);
  });
});
