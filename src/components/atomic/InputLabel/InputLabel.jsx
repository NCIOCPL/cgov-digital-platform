import React from 'react';
import PropTypes from 'prop-types';
import './InputLabel.scss';

const InputLabel = ({
  label,
  labelHint,
  htmlFor,
  required,
  hasError
}) => {
  let classes = 'cts-label';
  classes += required ? ' cts-label--required' : '';
  classes += hasError ? ' cts-label--error' : '';
  return (
    <label id={`${htmlFor}-label`} className={classes} htmlFor={htmlFor}>
      {label}
      {labelHint && <span className="cts-hint"> {labelHint}</span>}
    </label>
  );
};

InputLabel.propTypes = {
  hasError: PropTypes.bool,
  htmlFor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelHint: PropTypes.string,
  required: PropTypes.bool,
};

export default InputLabel;
