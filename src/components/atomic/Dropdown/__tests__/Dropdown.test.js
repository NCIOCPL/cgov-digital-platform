import React from 'react';
import { mount } from 'enzyme';

import Dropdown from '../Dropdown.jsx';
jest.unmock('../Dropdown.jsx');

describe('Dropdown', () => {

  let wrapper = null;
  const labelText = 'label goes here';
  
  beforeEach(function() {
    wrapper = mount(
      <Dropdown label={labelText}>
        <option value='value1'>Option A</option>
        <option value='value2'>Option B</option>
        <option value='value3'>Option C</option>
      </Dropdown>);
  });

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the label text correctly', () => {
    const labelElement = wrapper.find('label');
    expect(labelElement.text()).toBe(labelText);
  });

  it('has an id attribute', () => {
    expect(typeof wrapper.find('select').props().id).toBe('string');
  });

  it('has a matching id and htmlFor attributes', () => {
    const id = wrapper.find('select').props().id;
    const htmlFor = wrapper.find('label').props().htmlFor;
    expect(htmlFor).toBe(id);
  });

  it('adds a placeholder if there\'s no value', () => {
    expect(wrapper.find('option').first().text()).toBe('Select ...');
  });

  it('accepts a value property', () => {
    const testValue = 'testing';
    wrapper = mount(<Dropdown value={testValue} label={labelText}>
      <option value='value1'>Option A</option>
      <option value='value2'>Option B</option>
      <option value='value3'>Option C</option>
    </Dropdown>);
    const value = wrapper.find('select').props().value;
    expect(value).toBe(testValue);
  });

  it('accepts the required property', () => {
    wrapper = mount(<Dropdown required label={labelText}>
      <option value='value1'>Option A</option>
      <option value='value2'>Option B</option>
      <option value='value3'>Option C</option>
    </Dropdown>);
    expect(wrapper.find('label').hasClass('cts-label--required')).toBe(true);
  });

  it('displays the error message when present', () => {
    const message = 'error message';
    wrapper = mount(<Dropdown errorMessage={message} label={labelText}>
      <option value='value1'>Option A</option>
      <option value='value2'>Option B</option>
      <option value='value3'>Option C</option>
    </Dropdown>);
    expect(wrapper.find('.cts-error-message').text()).toBe(message);
  });

  it('handles onChange event', () => {
    const testValue = 'value3';
    wrapper = mount(<Dropdown value={'value1'} label={labelText}>
      <option value='value1'>Option A</option>
      <option value='value2'>Option B</option>
      <option value='value3'>Option C</option>
    </Dropdown>);
    wrapper.find('select').simulate('change', {target: { value : testValue}});
    expect(wrapper.find('select').props().value).toBe(testValue);
  });
});
