import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Accordion, AccordionItem, Table } from '../../atomic';
import './SearchCriteriaTable.scss';

const SearchCriteriaTable = () => {
  //store vals
  const {
    a,
    ct,
    subtypes,
    stages,
    findings,
    q,
    lo,
    z,
    zp,
    inv,
    tid,
    hv,
    tt,
    tp,
    va,
    drugs,
    treatments,
  } = useSelector(store => store.form);

  const [criterion, setCriterion] = useState([]);
  useEffect(()=> {
    formatStoreDataForDisplay()
  }, []);

  const criteria = [];
  const formatStoreDataForDisplay = () => {
    if (a && a !== '') {
      criteria.push({ category: 'Age', selection: a });
    }

    if (z && z !== '') {
      criteria.push({
        category: 'Near ZIP Code:',
        selection: 'within ' + zp + ' miles of ' + z,
      });
    }

    if (ct && ct.code.length > 0) {
      criteria.push({
        category: 'Primary Cancer Type/Condition',
        selection: ct.value,
      });
    }

    if (subtypes && subtypes.length > 0) {
      let joinedVals = [];
      subtypes.forEach(function(subtype) {
        joinedVals.push(subtype.label);
      });

      criteria.push({ category: 'Subtype', selection: joinedVals.join(', ') });
    }

    if (stages && stages.length > 0) {
      let joinedVals = [];
      stages.forEach(function(stage) {
        joinedVals.push(stage.label);
      });
      criteria.push({ category: 'Stage', selection: joinedVals.join(', ') });
    }

    if (findings && findings.length > 0) {
      let joinedVals = [];
      findings.forEach(function(finding) {
        joinedVals.push(finding.label);
      });
      criteria.push({
        category: 'Side Effects / Biomarkers / Participant Attributes',
        selection: joinedVals.join(', '),
      });
    }

    if (q && q !== '') {
      criteria.push({ category: 'Keywords/Phrases', selection: q });
    }

    if (va) {
      criteria.push({
        category: 'Veterans Affairs Facilities',
        selection: 'Results limited to trials at Veterans Affairs facilities',
      });
    }

    if (hv) {
      criteria.push({
        category: 'Healthy Volunteers',
        selection: 'Results limited to trials accepting healthy volunteers',
      });
    }

    if (tt) {
      let joinedVals = [];
      tt.forEach(function(trialType) {
        if (trialType.checked) {
          joinedVals.push(trialType.label);
        }
      });
      if (joinedVals.length > 0 && joinedVals.length !== tt.length) {
        criteria.push({
          category: 'Trial Type',
          selection: joinedVals.join(', '),
        });
      }
    }

    if (drugs && drugs.length > 0) {
      let joinedVals = '';
      drugs.forEach(function(drug) {
        joinedVals += drug.name + ', ';
      });
      criteria.push({
        category: 'Drug/Drug Family',
        selection: joinedVals,
      });
    }

    if (treatments && treatments.length > 0) {
      let joinedVals = '';
      treatments.forEach(function(treatment) {
        joinedVals += treatment.name + ', ';
      });
      criteria.push({
        category: 'Other Treatments',
        selection: joinedVals,
      });
    }

    if (tp) {
      let joinedVals = [];
      tp.forEach(function(phase) {
        if (phase.checked === true) {
          joinedVals.push(phase.label);
        }
      });
      if (joinedVals.length > 0 && joinedVals.length < tp.length) {
        criteria.push({
          category: 'Trial Phase',
          selection: joinedVals.join(', '),
        });
      }
    }

    if (tid && tid !== '') {
      criteria.push({ category: 'Trial ID', selection: tid });
    }

    if (inv && inv.value !== '') {
      criteria.push({ category: 'Trial Investigators', selection: inv.value });
    }

    if (lo && lo.value !== '') {
      criteria.push({ category: 'Lead Organizations', selection: lo.value });
    }

    setCriterion([...criteria]);
  };

  return (
    criterion.length? (
    <Accordion bordered startCollapsed>
      <AccordionItem title="Show Search Criteria">
        <div className="search-criteria-table">
          <Table
            borderless
            columns={[
              { colId: 'category', displayName: 'Category' },
              { colId: 'selection', displayName: 'Your Selection' },
            ]}
            data={criterion}
          />
        </div>
      </AccordionItem>
    </Accordion>
    ) : null
  )
};

export default SearchCriteriaTable;
