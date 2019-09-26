import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Fieldset, Checkbox } from '../../atomic';
import './TrialPhase.scss';

const TrialPhase = ({ phaseFields, handleUpdate }) => {
  const initPhases = phaseFields.map(phase => {
    if (phase && !phase.checked) {
      return {
        ...phase,
        checked: false,
      };
    } else {
      return phase;
    }
  });
  const [phases, setPhases] = useState(initPhases);

  useEffect(() => {
    handleUpdate('tp', [...phases]);
  }, [phases, handleUpdate]);

  const handleSelectAll = e => {
    setPhases(
      phases.map(phase => ({
        ...phase,
        checked: false,
      }))
    );
  };

  const handleCheckPhase = e => {
    const filtered = phases.map(phase => {
      if (phase.value === e.target.value) {
        return {
          ...phase,
          checked: e.target.checked,
        };
      } else {
        return phase;
      }
    });
    setPhases(filtered);
  };

  return (
    <Fieldset
      id="trialphase"
      classes="trial-phase"
      legend="Trial Phase"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialphase"
    >
      <p>Search by one or more trial phases.</p>
      <div className="select-all">
        <Checkbox
          value=""
          name="tp"
          id="tp_all"
          label="All"
          classes="tp-all"
          checked={phases.every(phase => !phase.checked)}
          onChange={handleSelectAll}
        />
      </div>
      <div className="group-phases">
        {phases.map((field, idx) => (
          <Checkbox
            id={'tp_' + field.value}
            key={'tp_' + field.value}
            name="tp"
            value={field.value}
            label={field.label}
            onChange={handleCheckPhase}
            checked={field.checked}
          />
        ))}
      </div>
    </Fieldset>
  );
};

TrialPhase.propTypes = {
  phaseFields: PropTypes.array,
  handleUpdate: PropTypes.func,
};

TrialPhase.defaultProps = {
  phaseFields: [
    { label: 'Phase I', value: 'I' },
    { label: 'Phase I', value: 'II' },
    { label: 'Phase III', value: 'III' },
    { label: 'Phase IV', value: 'IV' },
  ],
};

export default TrialPhase;
