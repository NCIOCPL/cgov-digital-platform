import React from 'react';
import PropTypes from 'prop-types';
import './TrialStatusIndicator.scss';

const TrialStatusIndicator = ({
  status = 'active'
}) => {
  return (
    <div className="trial-status-indicator active">
      <span className="show-for-sr">Trial </span>
      Status: { status }
    </div>
  );
};

TrialStatusIndicator.propTypes = {
  status: PropTypes.string
};

TrialStatusIndicator.defaultProps = {
  status: 'TrialStatusIndicator'
};

export default TrialStatusIndicator;
