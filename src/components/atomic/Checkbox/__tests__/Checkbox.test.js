import React from 'react';
import { render, mount } from 'enzyme';
import Checkbox from '../Checkbox';

jest.unmock('../Checkbox.jsx');

const defaultProps = {
  label: 'label goes here',
  id: 'mock-checkbox',
};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(<Checkbox {...props} />);
  return component;
};

describe('Checkbox', () => {
  describe('Render', () => {

    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });
  });

  it('is defined', () => {
    const wrapper = setup(render, defaultProps);
    expect(wrapper).toBeDefined();
  });

  it('renders the label text correctly', () => {
    const wrapper = setup(mount, defaultProps);
    const labelElement = wrapper.find('label');
    expect(labelElement.text()).toBe(defaultProps.label);
  });

  it('has an id attribute', () => {
    const wrapper = setup(mount, defaultProps);
    expect(typeof wrapper.find('input').props().id).toBe('string');
  });

  it('has a matching id and htmlFor attributes', () => {
    const wrapper = setup(mount, defaultProps);
    const inputId = wrapper.find('input').props().id;
    const labelHtmlFor = wrapper.find('label').props().htmlFor;
    expect(labelHtmlFor).toBe(inputId);
  });

  it('has a default value property', () => {
    const wrapper = setup(mount, defaultProps);
    const id = wrapper.find('input').props().id;
    const value = wrapper.find('input').props().value;
    expect(value).toBe(id);
  });

  it('accepts a value property', () => {
    const testValue = 'testing';
    const wrapper = setup(mount, {
      ...defaultProps,
      value: testValue
    });
    const inputValue = wrapper.find('input').props().value;
    expect(inputValue).toBe(testValue);
  });

  it('has a default name property', () => {
    const wrapper = setup(mount, defaultProps);
    const inputName = wrapper.find('input').props().name;
    expect(inputName).toBe('checkboxes');
  });

  it('accepts a name property', () => {
    const testValue = 'testing';
    const wrapper = setup(mount, {
      ...defaultProps,
      name: testValue
    });
    const inputName = wrapper.find('input').props().name;
    expect(inputName).toBe(testValue);
  });

  it('it is not checked by default', () => {
    const wrapper = setup(mount, defaultProps);
    const inputChecked = wrapper.find('input').props().defaultChecked;
    expect(inputChecked).toBe(false);
  });

  it('accepts the defaultChecked property', () => {
    const wrapper = setup(mount, {
      ...defaultProps,
      defaultChecked: true
    });
    const inputChecked = wrapper.find('input').props().defaultChecked;
    expect(inputChecked).toBe(true);
  });

  it('is not disabled by default', () => {
    const wrapper = setup(mount, defaultProps);
    const inputDisabled = wrapper.find('input').props().disabled;
    expect(inputDisabled).toBe(false);
  });

  it('accepts the disabled property', () => {
    const wrapper = setup(mount, {
      ...defaultProps,
      disabled: true
    });
    const inputDisabled = wrapper.find('input').props().disabled;
    expect(inputDisabled).toBe(true);
  });
});
