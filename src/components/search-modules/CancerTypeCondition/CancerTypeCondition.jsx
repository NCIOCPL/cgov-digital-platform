import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Fieldset, Autocomplete, InputLabel } from '../../atomic';
import { getMainType, getCancerTypeDescendents } from '../../../store/actions';
import { useChipList, useCachedValues } from '../../../utilities/hooks';
import './CancerTypeCondition.scss';

const CancerTypeCondition = ({ handleUpdate }) => {
  const dispatch = useDispatch();
  const [cancerType, setCancerType] = useState({ value: '', codes: [] });
  const [searchText, setSearchText] = useState({ value: '', codes: [] });

  const subtypeChips = useChipList('subtypes', handleUpdate);
  const stageChips = useChipList('stages', handleUpdate);
  const finChips = useChipList('findings', handleUpdate);
  const [subtype, setSubtype] = useState({ value: '' });
  const [stage, setStage] = useState({ value: '' });
  const [sideEffects, setSideEffects] = useState({ value: '' });
  const [ctMenuOpen, setCtMenuOpen] = useState(false);

  const {
    maintypes = [],
    subtypes = [],
    findings = [],
    stages = [],
  } = useCachedValues(['maintypes', 'subtypes', 'findings', 'stages']);

  // Retrieval of main types is triggered by expanding the cancer type dropdown
  useEffect(() => {
    // if maintypes is essentially empty, fetch mainTypes
    if(maintypes.length < 1 && ctMenuOpen){
      dispatch(getMainType({})); 
    }
    if (cancerType.codes && cancerType.codes.length > 0) {
      dispatch(
        getCancerTypeDescendents({
          cacheKey: cancerType.value,
          codes: cancerType.codes,
        })
      );
    }
  }, [ctMenuOpen, dispatch]);

  const matchItemToTerm = (item, value) => {
    return item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  };

  const filterSelectedItems = (items = [], selections = []) => {
    if (!items.length || !selections.length) {
      return items;
    }
    return items.filter(
      item => !selections.find(selection => selection.label === item.name)
    );
  };

  const ctSelectButtonDisplay =
    cancerType.codes.length === 0 ? 'All' : cancerType.value;

  const handleCTSelectToggle = () => {
    setCtMenuOpen(!ctMenuOpen);
  };

  const handleCTSelect = (value, item) => {
    handleUpdate('ct', {
      value,
      code: item.codes,
    });
    setCancerType({ value, codes: item.codes });
    setCtMenuOpen(false);
    setSearchText({ value: '', codes: null });
  };

  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype"
      classes="cancer-type-condition"
    >
      <p>
        Select a cancer type or condition. Select additional options, if
        applicable.
      </p>

      <div className="ct-select">
        <InputLabel label="Primary Cancer Type/Condition" htmlFor="ct" />
        <button
          id="ct-btn"
          className="ct-select__button faux-select"
          onClick={handleCTSelectToggle}
          aria-label="Click to select specific cancer type"
          aria-expanded={ctMenuOpen}
        >
          {ctSelectButtonDisplay}
        </button>
        <div className={`ct-select__menu ${ctMenuOpen ? 'open' : ''}`}>
          <Autocomplete
            id="ct-searchTerm"
            label="Primary Cancer Type/Condition"
            value={searchText.value}
            inputClasses="faux-select"
            labelHidden={true}
            wrapperStyle={{ position: 'relative', display: 'inline-block' }}
            open={true}
            items={maintypes}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setSearchText({ value, codes: [] })}
            onSelect={(value, item) => {
              handleCTSelect(value, item);
            }}
            renderMenu={children => (
              <div className="cts-autocomplete__menu --ct">{children}</div>
            )}
            renderItem={(item, isHighlighted) => (
              <div
                className={`cts-autocomplete__menu-item ${
                  isHighlighted ? 'highlighted' : ''
                }`}
                key={item.codes[0] || 'all'}
              >
                {item.name}
              </div>
            )}
          />
        </div>
        <input type="hidden" id="ct" name="ct" value={cancerType.value} />
      </div>

      {cancerType.codes.length > 0 && (
        <div className="subsearch">
          <Autocomplete
            id="st"
            label="Subtype"
            value={subtype.value}
            inputProps={{ placeholder: 'Select a subtype' }}
            items={filterSelectedItems(subtypes, subtypeChips.list)}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setSubtype({ value })}
            onSelect={value => {
              subtypeChips.add(value);
              setSubtype({ value: '' });
            }}
            multiselect={true}
            chipList={subtypeChips.list}
            onChipRemove={e => {
              subtypeChips.remove(e.label);
            }}
            renderMenu={children => (
              <div className="cts-autocomplete__menu --subtype">{children}</div>
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

          <Autocomplete
            id="stg"
            label="Stage"
            value={stage.value}
            inputProps={{ placeholder: 'Select a stage' }}
            items={filterSelectedItems(stages, stageChips.list)}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setStage({ value })}
            onSelect={value => {
              stageChips.add(value);
              setStage({ value: '' });
            }}
            multiselect={true}
            chipList={stageChips.list}
            onChipRemove={e => stageChips.remove(e.label)}
            renderMenu={children => (
              <div className="cts-autocomplete__menu --stage">{children}</div>
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

          <Autocomplete
            id="fin"
            label="Side Effects/Biomarkers/Participant Attributes"
            value={sideEffects.value}
            inputProps={{ placeholder: 'Examples: Nausea, BRCA1' }}
            items={filterSelectedItems(findings, finChips.list)}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setSideEffects({ value })}
            onSelect={value => {
              finChips.add(value);
              setSideEffects({ value: '' });
            }}
            multiselect={true}
            chipList={finChips.list}
            onChipRemove={e => finChips.remove(e.label)}
            renderMenu={children => (
              <div className="cts-autocomplete__menu --fin">{children}</div>
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
        </div>
      )}
    </Fieldset>
  );
};

export default CancerTypeCondition;
