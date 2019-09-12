import React from 'react';
import PropTypes from 'prop-types';

//  Label for form fields
//  @returns {node} the rendered DOM node
//  @param {string} label required - text for the input's label
//  @param {string} labelHint - hint text for the input's label
//  @param {string} htmlFor required - sets the <label for... attribute
//  @param {bool} hasError -  edds error styling
//  @param {bool} required -  edds required styling

export default function InputLabel({
  label,
  labelHint,
  htmlFor,
  required,
  hasError
}) {
  let classes = 'usa-label';
  classes += required ? ' usa-label--required' : '';
  classes += hasError ? ' usa-label--error' : '';
  return (
    <label id={`${htmlFor}-label`} className={classes} htmlFor={htmlFor}>
      {label}
      {labelHint && <span className='usa-hint'> {labelHint}</span>}
    </label>
  );
}

InputLabel.propTypes = {
  hasError: PropTypes.bool,
  htmlFor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelHint: PropTypes.string,
  required: PropTypes.bool
};
