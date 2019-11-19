import React from 'react';
import PropTypes from 'prop-types';
import './TrialStatusIndicator.scss';

const TrialStatusIndicator = ({
  status = 'active'
}) => {

  const getIndicatorClass = () => {
    let indicatorClass = ''
    switch(status){
      case 'enrolling by invitation':
        indicatorClass = 'invite';
        break;
      case 'temporarily closed to accrual':
      case 'temporarily closed to accrual and intervention':
        indicatorClass = 'closed';
        break;
      case 'not yet active':
      case 'in review':
      case 'approved':
        indicatorClass = 'not-active';
        break;
      case 'active':
      default:
        indicatorClass = 'active';
    }
    return indicatorClass;
  }

  return (
    <div className={`trial-status-indicator ${getIndicatorClass()}`}>
      <span className="show-for-sr">Trial </span>
      Status: { status }
    </div>
  );
};

TrialStatusIndicator.propTypes = {
  status: PropTypes.string
};

export default TrialStatusIndicator;
