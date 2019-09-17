import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Fieldset, Checkbox } from '../../atomic';
import './TrialPhase.scss';

const TrialPhase = ({ selectedPhases }) => {
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    //initialize trials state after mount
    setPhases([...selectedPhases]);
  }, []);

  const handleSelectAll = e => {
    setPhases([]);
  };

  const handleCheckPhase = e => {
    let filtered = [];
    if (e.target.checked) {
      setPhases([...phases, e.target.value]);
    } else {
      filtered = phases.filter((value, index, arr) => {
        return value !== e.target.value;
      });
      setPhases([...filtered]);
    }
  };

  return (
    <Fieldset
      id="trialphase"
      classes="trial-phase"
      legend="Trial Phase"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialphase"
    >
      <p>Search by one or more trial phases.</p>
      <Checkbox
        value=""
        name="tp"
        id="tp_all"
        label="All"
        classes="tp-all"
        checked={phases.length === 0}
        onChange={handleSelectAll}
      />
      <div className="group-phases">
        <Checkbox
          name="tp"
          id="tp_1"
          value="I"
          label="Phase I"
          onChange={handleCheckPhase}
          checked={phases.includes('I')}
        />
        <Checkbox
          name="tp"
          id="tp_2"
          value="II"
          label="Phase II"
          onChange={handleCheckPhase}
          checked={phases.includes('II')}
        />
        <Checkbox
          name="tp"
          id="tp_3"
          value="III"
          label="Phase III"
          onChange={handleCheckPhase}
          checked={phases.includes('III')}
        />
        <Checkbox
          name="tp"
          id="tp_4"
          value="IV"
          label="Phase IV"
          onChange={handleCheckPhase}
          checked={phases.includes('IV')}
        />
      </div>
    </Fieldset>
  );
};

TrialPhase.propTypes = {
  selectedPhases: PropTypes.array,
};

TrialPhase.defaultProps = {
  selectedPhases: [],
};

export default TrialPhase;
