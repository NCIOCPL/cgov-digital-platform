import React from 'react';
import PropTypes from 'prop-types';
import './RadioButton.scss';

const RadioButton = ({
  sampleProperty
}) => (
  <div className="radio-button">
    { sampleProperty }
  </div>
);

RadioButton.propTypes = {
  sampleProperty: PropTypes.string
};

RadioButton.defaultProps = {
  sampleProperty: 'RadioButton'
};

export default RadioButton;
