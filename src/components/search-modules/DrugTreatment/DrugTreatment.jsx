import React, { useState } from 'react';
import { Fieldset, Autocomplete, TextInput } from '../../atomic';
import { getTreatments, getDrugs } from '../../../mocks/mock-interventions';
import './DrugTreatment.scss';

const DrugTreatment = () => {
  const [drugVal, setDrugVal] = useState({ value: '' });
  const [drugChips, setDrugChips] = useState([]);
  const [trtmtVal, setTrtmtVal] = useState({ value: '' });

  const placeholder = 'Please enter 3 or more characters';

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

  // remove chip

  const handleRemoveChip = e => {
    let newChipList = drugChips.filter((value, index, arr) => {
      return value.label !== e.label;
    });
    console.log(newChipList);
    setDrugChips([...newChipList]);
  };

  // Add a chip once selected
  const addChip = val => {
    setDrugChips([...drugChips, { label: val.value }]);
    //reset input
    setDrugVal({ value: '' });
  };

  return (
    <Fieldset
      id="type"
      legend="Drug/Treatment"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#drugtreatment"
    >
      <p>
        Search for a specific drug or intervention. You can use the drug's
        generic or brand name.
      </p>

      <Autocomplete
        id="dt"
        label="Drug/Drug Family"
        value={drugVal.value}
        inputProps={{ id: 'dt' }}
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={getDrugs().terms}
        getItemValue={item => item.name}
        shouldItemRender={matchItemToTerm}
        onChange={(event, value) => setDrugVal({ value })}
        onSelect={value => addChip({ value })}
        multiselect={true}
        chipList={drugChips}
        onChipRemove={handleRemoveChip}
        renderMenu={children => (
          <div className="cts-autocomplete__menu --drugs">{children}</div>
        )}
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
      <TextInput id="ot" label="Other Treatments" />
    </Fieldset>
  );
};

export default DrugTreatment;
