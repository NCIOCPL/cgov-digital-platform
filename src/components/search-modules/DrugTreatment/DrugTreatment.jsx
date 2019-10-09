import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fieldset, Autocomplete } from '../../atomic';
import { searchDrugs, searchOtherInterventions } from '../../../store/actions';
import { useChipList } from '../../../utilities/hooks';

import './DrugTreatment.scss';

const DrugTreatment = ({ handleUpdate, useValue }) => {
  const placeholderText = 'Please enter 3 or more characters';
  const dispatch = useDispatch();

  //store vals
  const { drugs, treatments } = useSelector(store => store.cache);

  //chip lists
  const drugChips = useChipList('drugs', handleUpdate);
  const treatmentChips = useChipList('treatments', handleUpdate);

  //input state
  const [drugVal, setDrugVal] = useState({ value: '' });
  const [treatmentVal, setTreatmentVal] = useState({ value: '' });

  //based on drug field input
  useEffect(() => {
    if (drugVal.value.length > 2) {
      dispatch(searchDrugs({ searchText: drugVal.value }));
    }
  }, [drugVal, dispatch]);

  //based on treatments field input
  useEffect(() => {
    if (treatmentVal.value.length > 2) {
      dispatch(searchOtherInterventions({ searchText: treatmentVal.value }));
    }
  }, [treatmentVal, dispatch]);

  const matchItemToTerm = (item, value) => {
    //convert synonyms array to lowercase for comparison
    let lcSynonyms = item.synonyms.map(s => {
      return s.toLowerCase();
    });
    return (
      item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
      lcSynonyms.includes(value.toLowerCase())
    );
  };

  const filterSelectedItems = (items = [], selections = []) => {
    if (!items.length || !selections.length) {
      return items;
    }
    const filteredItems = items.filter(
      item => !selections.find(selection => selection.label === item.name)
    );
    return filteredItems;
  };

  return (
    <Fieldset
      id="drug-trtmt"
      legend="Drug/Treatment"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#drugtreatment"
    >
      <p>
        Search for a specific drug or intervention.
      </p>

      <Autocomplete
        id="dt"
        label="Drug/Drug Family"
        inputHelpText="You can use the drug's generic or brand name."
        value={drugVal.value}
        inputProps={{ placeholder: placeholderText }}
        items={filterSelectedItems(drugs, drugChips.list)}
        getItemValue={item => item.name}
        shouldItemRender={matchItemToTerm}
        onChange={(event, value) => setDrugVal({ value })}
        onSelect={value => {
          drugChips.add(value);
          setDrugVal({ value: '' });
        }}
        multiselect={true}
        chipList={drugChips.list}
        onChipRemove={e => drugChips.remove(e.label)}
        renderMenu={children => {
          return (
            <div className="cts-autocomplete__menu --drugs">
              {(drugVal.value.length > 2 )
                ? (filterSelectedItems(drugs, drugChips.list).length)
                    ? (children)
                    : <div className="cts-autocomplete__menu-item">No results found</div>
                : <div className="cts-autocomplete__menu-item">{placeholderText}</div>
              }
            </div>
          );
        }}
        renderItem={(item, isHighlighted) => (
          <div
            className={`cts-autocomplete__menu-item ${
              isHighlighted ? 'highlighted' : ''
            }`}
            key={item.codes[0]}
          >
            <div className="preferredName">
              {item.name}
              {item.category.indexOf('category') !== -1 ? ' (DRUG FAMILY)' : ''}
            </div>
            {item.synonyms.length > 0 && (
              <span className="synonyms">
                Other Names: {item.synonyms.join(', ')}
              </span>
            )}
          </div>
        )}
      />

      <Autocomplete
        id="ti"
        label="Other Treatments"
        value={treatmentVal.value}
        inputProps={{ placeholder: placeholderText }}
        items={filterSelectedItems(treatments, treatmentChips.list)}
        getItemValue={item => item.name}
        shouldItemRender={matchItemToTerm}
        onChange={(event, value) => setTreatmentVal({ value })}
        onSelect={value => {
          treatmentChips.add(value);
          setTreatmentVal({ value: '' });
        }}
        multiselect={true}
        chipList={treatmentChips.list}
        onChipRemove={e => treatmentChips.remove(e.label)}
        renderMenu={children => {
          return (
            <div className="cts-autocomplete__menu --drugs">
              {(treatmentVal.value.length > 2 )
                ? (filterSelectedItems(treatments, treatmentChips.list).length)
                    ? (children)
                    : <div className="cts-autocomplete__menu-item">No results found</div>
                : <div className="cts-autocomplete__menu-item">{placeholderText}</div>
              }
            </div>
          );
        }}
        renderItem={(item, isHighlighted) => (
          <div
            className={`cts-autocomplete__menu-item ${
              isHighlighted ? 'highlighted' : ''
            }`}
            key={item.codes[0]}
          >
            <div className="preferredName">
              {item.name}
              {item.category.indexOf('category') !== -1 ? ' (DRUG FAMILY)' : ''}
            </div>
            {item.synonyms.length > 0 && (
              <span className="synonyms">
                Other Stuff Names: {item.synonyms.join(', ')}
              </span>
            )}
          </div>
        )}
      />
    </Fieldset>
  );
};

export default DrugTreatment;
