import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Checkbox, Fieldset, Toggle } from '../../atomic';
import './TrialType.scss';

const TrialType = ({ trialTypeFields, handleUpdate }) => {
  const healthyVolunteers = useSelector(store => store.form.hv);
  const [hvToggle, setHvToggle] = useState(healthyVolunteers);
  const initPhases = trialTypeFields.map(type => {
    if (type && !type.checked) {
      return {
        ...type,
        checked: false,
      };
    } else {
      return type;
    }
  });

  const [trialTypes, setTrialTypes] = useState(initPhases);

  useEffect(() => {
    handleUpdate('tt', [...trialTypes]);
  }, [trialTypes, handleUpdate]);

  useEffect(() => {
    handleUpdate('hv', hvToggle);
  }, [hvToggle, handleUpdate]);

  const handleToggle = checked => {
    setHvToggle(!hvToggle);
  };

  const handleSelectAll = e => {
    setTrialTypes(
      trialTypes.map(type => ({
        ...type,
        checked: false,
      }))
    );
  };

  const handleCheckType = e => {
    const filtered = trialTypes.map(type => {
      if (type.value === e.target.value) {
        return {
          ...type,
          checked: e.target.checked,
        };
      } else {
        return type;
      }
    });
    setTrialTypes(filtered);
  };

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

      <div className="data-toggle-block">
        <Toggle
          id="hv"
          checked={hvToggle}
          label="Limit results to Veterans Affairs facilities"
          onClick={handleToggle}
        />
        Limit results to trials accepting healthy volunteers
      </div>
      <div className="select-all">
        <Checkbox
          value=""
          id="tt_all"
          label="All"
          classes="tt-all"
          checked={trialTypes.every(type => !type.checked)}
          onChange={handleSelectAll}
        />
      </div>
      <div className="group-trial-types">
        {trialTypes.map((trialType, idx) => (
          <Checkbox
            key={idx}
            id={`tp_${trialType.value}`}
            value={trialType.value}
            label={trialType.label}
            onChange={handleCheckType}
            checked={trialType.checked}
          />
        ))}
      </div>
    </Fieldset>
  );
};

TrialType.propTypes = {
  trialTypeFields: PropTypes.array,
  handleUpdate: PropTypes.func,
};

TrialType.defaultProps = {
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
