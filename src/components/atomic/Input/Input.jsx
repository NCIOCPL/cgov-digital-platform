import React from 'react';
import PropTypes from 'prop-types';
import './Input.scss';

const Input = ({
  sampleProperty
}) => (
  <div className="input">
    { sampleProperty }
  </div>
);

Input.propTypes = {
  sampleProperty: PropTypes.string
};

Input.defaultProps = {
  sampleProperty: 'Input'
};

export default Input;
