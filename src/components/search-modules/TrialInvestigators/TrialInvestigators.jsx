import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fieldset, Autocomplete } from '../../atomic';
import { searchTrialInvestigators } from '../../../store/actions';
import { matchItemToTerm, sortItems } from '../../../utilities/utilities';

const TrialInvestigators = ({ handleUpdate }) => {
  const dispatch = useDispatch();
  const [tiName, setTiName] = useState({ value: '' });

  //store vals
  const { tis = [] } = useSelector(store => store.cache);

  useEffect(() => {
    handleUpdate('inv', tiName);
  }, [tiName, handleUpdate]);

  useEffect(() => {
    if (tiName.value.length > 2) {
      dispatch(searchTrialInvestigators({ searchText: tiName.value }));
    }
  }, [tiName, dispatch]);


  return (
    <Fieldset
      id="trialInvestigators"
      legend="Trial Investigators"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialinvestigators"
    >
      <Autocomplete
        id="inv"
        label="Trial investigators"
        labelHidden
        inputHelpText="Search by Trial Investigators"
        value={tiName.value}
        inputProps={{ id: 'in', placeholder: 'Investigator name' }}
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={tis}
        getItemValue={item => item.term}
        shouldItemRender={matchItemToTerm}
        sortItems={sortItems}
        onChange={(event, value) => setTiName({ value })}
        onSelect={value => setTiName({ value })}
        renderMenu={children => (
          <div className="cts-autocomplete__menu --trialInvestigators">
            {(tiName.value.length > 2 )
                ? (tis.length)
                    ? (children)
                    : <div className="cts-autocomplete__menu-item">No results found</div>
                : <div className="cts-autocomplete__menu-item">Please enter 3 or more characters</div>
            }
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
