import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fieldset, Autocomplete } from '../../atomic';
import { getDiseasesForSimpleTypeAhead } from '../../../store/actions';

const CancerTypeKeyword = ({ handleUpdate }) => {
  const dispatch = useDispatch();
  const { keywordPhrases } = useSelector(store => store.form);
  const { diseases = [] } = useSelector(store => store.cache);

  const [cancerType, setCancerType] = useState({ value: keywordPhrases });

  useEffect(() => {
    dispatch(getDiseasesForSimpleTypeAhead({ name: cancerType.value }));
  }, [cancerType, dispatch]);

  const matchItemToTerm = (item, value) => {
    return item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  };

  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Keyword"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch"
    >
      <Autocomplete
        id="ctk"
        label="Cancer Type/Keyword"
        value={cancerType.value}
        inputProps={{ placeholder: 'Start typing to select a cancer type' }}
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={diseases}
        getItemValue={item => item.name}
        shouldItemRender={matchItemToTerm}
        onChange={(event, value) => {
          setCancerType({ value });
          handleUpdate('keywordPhrases', value);
          handleUpdate('typeCode', []);
        }}
        onSelect={(value, item) => {
          setCancerType({ value });
          handleUpdate('typeCode', item.codes);
          handleUpdate('keywordPhrases', value);
        }}
        renderMenu={children => (
          <div className="cts-autocomplete__menu --q">{children}</div>
        )}
        renderItem={(item, isHighlighted) => (
          <div
            className={`cts-autocomplete__menu-item ${
              isHighlighted ? 'highlighted' : ''
            }`}
            key={item.codes[0]}
          >
            {item.name}
          </div>
        )}
      />
    </Fieldset>
  );
};

export default CancerTypeKeyword;
