import React from 'react';
import PropTypes from 'prop-types';
import './Select.scss';

const Select = ({
  sampleProperty
}) => (
  <div className="select">
    { sampleProperty }
  </div>
);

Select.propTypes = {
  sampleProperty: PropTypes.string
};

Select.defaultProps = {
  sampleProperty: 'Select'
};

export default Select;
