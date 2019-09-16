import React from 'react';
import { mount } from 'enzyme';
import TextInput from '../TextInput.jsx';

jest.unmock('../TextInput.jsx');

describe('TextInput', () => {
  let wrapper = null;
  const label = 'label goes here';
  const testId = 'myId';

  beforeEach(function() {
    wrapper = mount(<TextInput id={testId} label={label} />);
  });

  it('renders without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('is defined', () => {
    expect(wrapper).toBeDefined();
  });

  it('renders the label text correctly', () => {
    const labelElement = wrapper.find('label');
    expect(labelElement.text()).toBe(label);
  });

  it('has an id attribute', () => {
    expect(typeof wrapper.find('input').props().id).toBe('string');
  });

  it('has a matching id and htmlFor attributes', () => {
    const id = wrapper.find('input').props().id;
    const labelHtmlFor = wrapper.find('label').props().htmlFor;
    expect(labelHtmlFor).toBe(id);
  });

  it('accepts a value property', () => {
    const testValue = 'testing';
    wrapper = mount(<TextInput id={testId} value={testValue} label={label} />);
    const value = wrapper.find('input').props().value;
    expect(value).toBe(testValue);
  });

  it('accepts the required property', () => {
    wrapper = mount(<TextInput required id={testId} label={label} />);
    expect(wrapper.find('label').hasClass('cts-label--required')).toBe(true);
  });
});
