import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Fieldset, Toggle } from '../../atomic';
import './TrialType.scss';

const TrialType = ({ selectedTrialTypes, trialTypeFields }) => {
  const [trialTypes, setTrialTypes] = useState([]);

  useEffect(() => {
    //initialize trials state after mount
    setTrialTypes([...selectedTrialTypes]);
  }, [selectedTrialTypes]);

  const handleSelectAll = e => {
    setTrialTypes([]);
  };

  const handleCheckType = e => {
    let filtered = [];
    if (e.target.checked) {
      setTrialTypes([...trialTypes, e.target.value]);
    } else {
      filtered = trialTypes.filter((value, index, arr) => {
        return value !== e.target.value;
      });
      setTrialTypes([...filtered]);
    }
  };

  const handleToggleChange = () => {

  }

  return (
    <Fieldset
      id="trialtype"
      legend="Trial Type"
      classes="trial-type"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialtype"
    >
      <p>
        Select the type of trial for your search. You may check more than one
        box or select "All."
      </p>

      <div className="healthy-volunteers">
        Limit results to trials accepting healthy volunteers:
        <Toggle
          id="hv"
          label="Limit results to Veterans Affairs facilities:"
          onChange={handleToggleChange}
        />
      </div>

      <Checkbox
        value=""
        name="tp"
        id="tp_all"
        label="All"
        classes="tp-all"
        checked={trialTypes.length === 0}
        onChange={handleSelectAll}
      />
      <div className="group-trial-types">
        {trialTypeFields.map((trialType, idx) => (
          <Checkbox
            key={idx}
            name="tt"
            id={`tp_${trialType.value}`}
            value={trialType.value}
            label={trialType.label}
            onChange={handleCheckType}
            checked={trialTypes.includes(trialType.value)}
          />
        ))}
      </div>
    </Fieldset>
  );
};

TrialType.propTypes = {
  selectedTrialTypes: PropTypes.array,
  trialTypeFields: PropTypes.array,
};

TrialType.defaultProps = {
  selectedTrialTypes: [],
  trialTypeFields: [
    { label: 'Treatment', value: 'treatment' },
    { label: 'Prevention', value: 'prevention' },
    { label: 'Supportive Care', value: 'supportive_care' },
    { label: 'Health Services Research', value: 'health_services_research' },
    { label: 'Diagnostic', value: 'diagnostic' },
    { label: 'Screening', value: 'screening' },
    { label: 'Basic Science', value: 'basic_science' },
    { label: 'Other', value: 'other' },
  ],
};

export default TrialType;
