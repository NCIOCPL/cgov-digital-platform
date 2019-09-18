import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  CancerTypeCondition,
  Age,
  KeywordsPhrases,
  Location,
  TrialType,
  DrugTreatment,
  TrialPhase,
  TrialId,
  TrialInvestigators,
  LeadOrganization,
} from '../../../components/search-modules';

const FormAdvanced = ({ handleUpdate }) => {
  //Module groups in arrays will be placed side-by-side in the form
  const modules = [
    CancerTypeCondition,
    [Age, KeywordsPhrases],
    Location,
    TrialType,
    DrugTreatment,
    TrialPhase,
    TrialId,
    TrialInvestigators,
    LeadOrganization,
  ];

  return (
    <>
      {modules.map((Module, idx) => {
        if (Array.isArray(Module)) {
          return <div key={`formAdvanced-${idx}`} className="side-by-side">
            {Module.map((Mod, i) => <Mod key={`formAdvanced-${idx}-${i}`} handleUpdate={handleUpdate} />)}
          </div>;
        } else {
          return <Module key={`formAdvanced-${idx}`} handleUpdate={handleUpdate} />;
        }
      })}
    </>
  );
};

FormAdvanced.propTypes = {
  handleUpdate: PropTypes.func,
};

export default FormAdvanced;