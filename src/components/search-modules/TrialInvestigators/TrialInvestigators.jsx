import React, { useState, useEffect } from 'react';
import { Fieldset, Autocomplete } from '../../atomic';
import { getTrialInvestigators } from '../../../mocks/mock-trial-investigator';
import { matchItemToTerm, sortItems } from '../../../utilities/utilities';
import './TrialInvestigators.scss';

const TrialInvestigators = ({ handleUpdate }) => {
  const [tiName, setTiName] = useState({ value: '' });
  useEffect(() => {
    handleUpdate('in', tiName);
  }, [tiName, handleUpdate]);
  return (
    <Fieldset
      id="trialInvestigators"
      legend="Trial Investigators"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialinvestigators"
    >
      <Autocomplete
        id="in"
        label="Search by Trial Investigators"
        value={tiName.value}
        inputProps={{ id: 'in' }}
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={getTrialInvestigators().terms}
        getItemValue={item => item.term}
        shouldItemRender={matchItemToTerm}
        sortItems={sortItems}
        onChange={(event, value) => setTiName({ value })}
        onSelect={value => setTiName({ value })}
        renderMenu={children => (
          <div className="cts-autocomplete__menu --trialInvestigators">
            {children}
          </div>
        )}
        renderItem={(item, isHighlighted) => (
          <div
            className={`cts-autocomplete__menu-item ${
              isHighlighted ? 'highlighted' : ''
            }`}
            key={item.term_key}
          >
            {item.term}
          </div>
        )}
      />
    </Fieldset>
  );
};

export default TrialInvestigators;
