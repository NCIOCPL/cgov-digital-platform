import React from 'react';
import PropTypes from 'prop-types';
import './Checkbox.scss';

const Checkbox = ({
  id,
  label,
  value,
  name,
  classes,
  disabled,
  ...otherProps
}) => (
  <div className={`cts-checkbox ${classes}`}>
    <input
      id={id}
      className="cts-checkbox__input"
      type="checkbox"
      name={name}
      value={value ? value : id}
      disabled={disabled || false}
      {...otherProps}
    />
    <label className="cts-checkbox__label" htmlFor={id}>
      {label}
    </label>
  </div>
);

Checkbox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.string,
};

Checkbox.defaultProps = {
  classes: '',
  name: 'checkboxes',
};

export default Checkbox;
