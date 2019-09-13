import React from 'react';
import PropTypes from 'prop-types';
import Utilities from '../../../utilities/utilities';

import './Radio.scss';

const Radio = ({ id, label, className, disabled, value, ...otherProps }) => (
  <div className={`cts-radio ${className}`}>
    <input
      className="cts-radio__input"
      type="radio"
      disabled={disabled}
      aria-disabled={disabled}
      id={id}
      value={value ? value : id}
      {...otherProps}
    />
    <label className="cts-radio__label" htmlFor={id}>
      {label}
    </label>
  </div>
);

Radio.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

Radio.defaultProps = {
  id: Utilities.uniqueIdForComponent(),
  name: 'radios',
  disabled: false,
  defaultChecked: false,
  className: '',
};

export default Radio;
