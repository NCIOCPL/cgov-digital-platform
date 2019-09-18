import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import { Autocomplete } from '../../atomic';
import { getStates, matchStateToTerm, sortStates } from '../../../mocks/mock-autocomplete-util';
import './LeadOrganization.scss';
import { set } from 'store2';

const LeadOrganization = () => {
  const [orgName, setOrgName] = useState({ value: '' });

  return (
    <Fieldset
      id="location"
      legend="Location"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#leadorganization"
    >
      <Autocomplete
        value={orgName.value}
        inputProps={{ id: 'states-autocomplete' }}
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={getStates()}
        getItemValue={item => item.name}
        shouldItemRender={matchStateToTerm}
        sortItems={sortStates}
        onChange={(event, value) => setOrgName({ value })}
        onSelect={value => setOrgName({ value })}
        renderMenu={children => <div className="menu">{children}</div>}
        renderItem={(item, isHighlighted) => (
          <div
            className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
            key={item.abbr}
          >
            {item.name}
          </div>
        )}
      />
    </Fieldset>
  );
};

LeadOrganization.propTypes = {
  sampleProperty: PropTypes.string,
};

LeadOrganization.defaultProps = {
  sampleProperty: 'LeadOrganization',
};

export default LeadOrganization;
