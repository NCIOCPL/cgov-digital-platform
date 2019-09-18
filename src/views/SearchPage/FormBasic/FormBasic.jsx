import React, { useState } from 'react';
import PropTypes from 'prop-types';

//modules
import {
  Age,
  CancerTypeKeyword,
  ZipCode,
} from '../../../components/search-modules/';

const FormBasic = ({ handleUpdate }) => {
  const modules = [CancerTypeKeyword, [Age, ZipCode]];

  return (
    <>
      {modules.map((Module, idx) => {
        if (Array.isArray(Module)) {
          return (
            <div key={`formAdvanced-${idx}`} className="side-by-side">
              {Module.map((Mod, i) => (
                <Mod
                  key={`formAdvanced-${idx}-${i}`}
                  handleUpdate={handleUpdate}
                />
              ))}
            </div>
          );
        } else {
          return (
            <Module key={`formAdvanced-${idx}`} handleUpdate={handleUpdate} />
          );
        }
      })}
    </>
  );
};

FormBasic.propTypes = {
  handleUpdate: PropTypes.func,
};

export default FormBasic;
