import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fieldset, Autocomplete } from '../../atomic';
import {
  getDiseasesForSimpleTypeAhead,
  getSubtypes,
  getStages,
  getFindings,
} from '../../../store/actions';
import { useChipList } from '../../../store/hooks';
import './CancerTypeCondition.scss';

const CancerTypeCondition = ({ handleUpdate }) => {
  const dispatch = useDispatch();
  const [cancerType, setCancerType] = useState({ value: 'All', codes: null });
  const subtypeChips = useChipList('subtypes', handleUpdate);
  const stageChips = useChipList('stages', handleUpdate);
  const finChips = useChipList('findings', handleUpdate);
  const [subtype, setSubtype] = useState({ value: '' });
  const [stage, setStage] = useState({ value: '' });
  const [sideEffects, setSideEffects] = useState({ value: '' });

  const { diseases, subtypes, stages, findings } = useSelector(
    store => store.results
  );
  useEffect(() => {
    dispatch(getDiseasesForSimpleTypeAhead({ name: cancerType.value }));
    if (cancerType.codes !== null) {
      dispatch(getStages({ ancestorId: cancerType.codes }));
      dispatch(getSubtypes({ ancestorId: cancerType.codes }));
      dispatch(getFindings({ ancestorId: cancerType.codes }));
    }
  }, [cancerType, dispatch]);

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
      <Autocomplete
        id="ct"
        label="Primary Cancer Type/Condition"
        value={cancerType.value}
        inputClasses="faux-select"
        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
        items={diseases}
        getItemValue={item => item.name}
        shouldItemRender={matchItemToTerm}
        onChange={(event, value) => setCancerType({ value, codes: [] })}
        onSelect={(value, item) => {
          handleUpdate('ct', {
            value,
            code: item.codes,
          });
          setCancerType({ value, codes: item.codes });
        }}
        renderMenu={children => (
          <div className="cts-autocomplete__menu --ct">{children}</div>
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
      {cancerType.value !== 'All' && (
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
