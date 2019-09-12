import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './CancerTypeCondition.scss';

const CancerTypeCondition = () => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype">
      <input type="text" />
    </Fieldset>
  );
};

CancerTypeCondition.propTypes = {
  sampleProperty: PropTypes.string
};

CancerTypeCondition.defaultProps = {
  sampleProperty: 'CancerTypeCondition'
};

export default CancerTypeCondition;
