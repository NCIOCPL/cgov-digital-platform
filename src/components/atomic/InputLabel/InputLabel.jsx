import React from 'react';
import PropTypes from 'prop-types';

const InputLabel = ({
  label,
  labelHint,
  htmlFor,
  required,
  hasError,
  classes,
}) => {
  return (
    <label id={`${htmlFor}-label`} className={`${classes} ${required? '--required': ''}`} htmlFor={htmlFor}>
      {label}
      {labelHint && <span className="cts-input__hint"> {labelHint}</span>}
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

InputLabel.defaultProps = {
  sampleProperty: 'InputLabel',
};

export default InputLabel;
