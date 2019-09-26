import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import { Autocomplete } from '../../atomic';
import { getLeadOrgs } from '../../../mocks/mock-lead-org';
import {matchItemToTerm, sortItems} from '../../../utilities/utilities';
import './LeadOrganization.scss';

const LeadOrganization = ({ handleUpdate }) => {
  const [orgName, setOrgName] = useState({ value: '' });
  useEffect(() => {
    handleUpdate('lo', orgName);
  }, [orgName, handleUpdate])
  return (
    <Fieldset
      id="lead_organization"
      legend="Lead Organization"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#leadorganization"
    >
      <Autocomplete
        label="Search by Lead Organization"
        value={orgName.value}
        inputProps={{ id: 'lo' }}
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={getLeadOrgs().terms}
        getItemValue={item => item.term}
        shouldItemRender={matchItemToTerm}
        sortItems={sortItems}
        onChange={(event, value) => setOrgName({ value })}
        onSelect={value => setOrgName({ value })}
        renderMenu={children => (
          <div className="cts-autocomplete__menu --leadOrg">{children}</div>
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

LeadOrganization.propTypes = {
  handleUpdate: PropTypes.func,
};

export default LeadOrganization;
