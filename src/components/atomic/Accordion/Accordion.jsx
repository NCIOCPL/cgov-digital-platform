import React from 'react';
import PropTypes from 'prop-types';
import './Accordion.scss';

const Accordion = ({
  sampleProperty
}) => {
  return (
    <div className="accordion">
      { sampleProperty }
    </div>
  );
};

Accordion.propTypes = {
  sampleProperty: PropTypes.string
};

Accordion.defaultProps = {
  sampleProperty: 'Accordion'
};

export default Accordion;
