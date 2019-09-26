import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fieldset, Autocomplete } from '../../atomic';
import { getDiseasesForSimpleTypeAhead, getSubtypes } from '../../../store/actions';
import {
  getMainTypes,
  getSubTypes,
  getStages,
  getSideEffects,
} from '../../../mocks/mock-diseases';
import './CancerTypeCondition.scss';

const CancerTypeCondition = ({ handleUpdate, useValue }) => {
  const dispatch = useDispatch();
  const [cancerType, setCancerType] = useState({ value: 'All', codes: null });
  const [subtype, setSubtype] = useState({ value: '' });
  const [subtypeChips, setSubtypeChips] = useState([]);
  const [stage, setStage] = useState({ value: '' });
  const [stageChips, setStageChips] = useState([]);
  const [sideEffects, setSideEffects] = useState({ value: '' });
  const [finChips, setFinChips] = useState([]);
  const { diseases, subtypes } = useSelector(store => store.results);
  useEffect(() => {
    dispatch(getDiseasesForSimpleTypeAhead({ name: cancerType.value }));
    if (cancerType.codes !== null) {
      dispatch(getSubtypes(cancerType.codes))
    }
  }, [cancerType, dispatch]);

  //TODO: Abstract these out to a hook
  useEffect(
    () =>
      handleUpdate({
        target: {
          value: [...subtypeChips],
          name: 'st',
        },
      }),
    [subtypeChips, handleUpdate]
  );
  useEffect(
    () =>
      handleUpdate({
        target: {
          value: [...stageChips],
          name: 'stage',
        },
      }),
    [stageChips, handleUpdate]
  );
  useEffect(
    () =>
      handleUpdate({
        target: {
          value: [...finChips],
          name: 'fin',
        },
      }),
    [finChips, handleUpdate]
  );

  const matchItemToTerm = (item, value) => {
    return item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  };

  // remove chip
  const handleRemoveChip = (e, chiplist, chiplistSetter) => {
    let newChipList = chiplist.filter((value, index, arr) => {
      return value.label !== e.label;
    });
    chiplistSetter([...newChipList]);
  };

  const addChip = (item, chipList, chipListSetter, inputSetter) => {
    //prevent dupes
    if (!chipList.includes(item.value)) {
      chipListSetter([...chipList, { label: item.value }]);
      inputSetter({ value: '' });
    }
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
          handleUpdate({
            target: {
              name: 'ct',
              value: {
                value,
                codes: item.codes,
              },
            },
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
            items={subtypes}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setSubtype({ value })}
            onSelect={value =>
              addChip({ value }, subtypeChips, setSubtypeChips, setSubtype)
            }
            multiselect={true}
            chipList={subtypeChips}
            onChipRemove={e =>
              handleRemoveChip(e, subtypeChips, setSubtypeChips)
            }
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
            id="stage"
            label="Stage"
            value={stage.value}
            inputProps={{ placeholder: 'Select a stage' }}
            items={getStages().terms}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setStage({ value })}
            onSelect={value =>
              addChip({ value }, stageChips, setStageChips, setStage)
            }
            multiselect={true}
            chipList={stageChips}
            onChipRemove={e => handleRemoveChip(e, stageChips, setStageChips)}
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
            items={getSideEffects().terms}
            getItemValue={item => item.name}
            shouldItemRender={matchItemToTerm}
            onChange={(event, value) => setSideEffects({ value })}
            onSelect={value =>
              addChip({ value }, finChips, setFinChips, setSideEffects)
            }
            multiselect={true}
            chipList={finChips}
            onChipRemove={e => handleRemoveChip(e, finChips, setFinChips)}
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
