import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './DrugTreatment.scss';

const DrugTreatment = () => {
  return (
    <Fieldset
      id="trialtreatment"
      legend="Drug/Treatment"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#drugtreatment">
      <input type="text" />
    </Fieldset>
  );
};

DrugTreatment.propTypes = {
  sampleProperty: PropTypes.string
};

DrugTreatment.defaultProps = {
  sampleProperty: 'DrugTreatment'
};

export default DrugTreatment;
