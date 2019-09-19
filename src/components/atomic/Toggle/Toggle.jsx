import React from 'react';
import PropTypes from 'prop-types';
import './Toggle.scss';

const Toggle = ({ id, classes, label, onClick, checked, ...otherProps }) => {
  return (
    <div className={`cts-toggle ${classes}`}>
      <input
        type="checkbox"
        className="cts-toggle__input"
        id={id}
        {...otherProps}
      />
      <label className="cts-toggle__label" htmlFor={id} aria-label={label} onClick={() => onClick(checked)}>
        <span aria-hidden="true" className="neg">
          No
        </span>
        <span aria-hidden="true" className="pos">
          Yes
        </span>
      </label>
    </div>
  );
};

Toggle.propTypes = {
  id: PropTypes.string,
  classes: PropTypes.string,
  label: PropTypes.string,
};

Toggle.defaultProps = {
  classes: '',
  label: '',
};

export default Toggle;
