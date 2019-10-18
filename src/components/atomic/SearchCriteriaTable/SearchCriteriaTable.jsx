import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Accordion, AccordionItem, Table } from '../../atomic';
import './SearchCriteriaTable.scss';

const SearchCriteriaTable = () => {
  //store vals
  const {
    age,
    cancerType,
    subtypes,
    stages,
    findings,
    keywordPhrases,
    leadOrg,
    zip,
    zipRadius,
    country,
    states,
    city,
    hospital,
    trialId,
    investigator,
    healthyVolunteers,
    trialTypes,
    trialPhases,
    nihOnly,
    vaOnly,
    drugs,
    treatments,
    location,
    formType,
  } = useSelector(store => store.form);

  const [criterion, setCriterion] = useState([]);
  useEffect(() => {
    formatStoreDataForDisplay();
  }, []);

  const criteria = [];
  const formatStoreDataForDisplay = () => {
    if (cancerType && cancerType.codes.length > 0) {
      criteria.push({
        category: 'Primary Cancer Type/Condition',
        selection: cancerType.name,
      });
    }

    if (formType === 'advanced') {
      if (subtypes && subtypes.length > 0) {
        let joinedVals = [];
        subtypes.forEach(function(subtype) {
          joinedVals.push(subtype.name);
        });

        criteria.push({
          category: 'Subtype',
          selection: joinedVals.join(', '),
        });
      }

      if (stages && stages.length > 0) {
        let joinedVals = [];
        stages.forEach(function(stage) {
          joinedVals.push(stage.name);
        });
        criteria.push({ category: 'Stage', selection: joinedVals.join(', ') });
      }

      if (findings && findings.length > 0) {
        let joinedVals = [];
        findings.forEach(function(finding) {
          joinedVals.push(finding.name);
        });
        criteria.push({
          category: 'Side Effects / Biomarkers / Participant Attributes',
          selection: joinedVals.join(', '),
        });
      }
    }

    if (formType === 'basic' && keywordPhrases && keywordPhrases !== '') {
      criteria.push({
        category: 'Keywords/Phrases',
        selection: keywordPhrases,
      });
    }

    if (age && age !== '') {
      criteria.push({ category: 'Age', selection: age });
    }

    if (formType === 'advanced' && keywordPhrases && keywordPhrases !== '') {
      criteria.push({
        category: 'Keywords/Phrases',
        selection: keywordPhrases,
      });
    }

    if (formType === 'basic' && zip && zip !== '') {
      criteria.push({
        category: 'Near ZIP Code',
        selection: 'within ' + zipRadius + ' miles of ' + zip,
      });
    }

    switch (location) {
      case 'search-location-zip':
        if (formType !== 'basic' && zip && zip !== '') {
          criteria.push({
            category: 'Near ZIP Code',
            selection: 'within ' + zipRadius + ' miles of ' + zip,
          });
        }
        break;
      case 'search-location-country':
        if (country === 'United States') {
          criteria.push({
            category: 'Country',
            selection: country,
          });
          if (states && states.length > 0) {
            let joinedVals = [];
            states.forEach(function(state) {
              joinedVals.push(state.name);
            });
            criteria.push({
              category: `${states.length > 1 ? 'State' : 'States'}`,
              selection: joinedVals.join(', '),
            });
          }
          if (city && city !== '') {
            criteria.push({
              category: 'City',
              selection: city,
            });
          }
        } else {
          criteria.push({
            category: 'Country',
            selection: country,
          });
          if (city && city !== '') {
            criteria.push({
              category: 'City',
              selection: city,
            });
          }
        }
        break;
      case 'search-location-hospital':
        if (hospital && hospital.term.length > 0) {
          criteria.push({
            category: 'At Hospital/Institution',
            selection: hospital.term,
          });
        }
        break;
      case 'search-location-nih':
        if (nihOnly) {
          criteria.push({
            category: 'At NIH',
            selection:
              'Only show trials at the NIH Clinical Center (Bethesda, MD)',
          });
        }
        break;
      default:
        break;
    }

    if (vaOnly) {
      criteria.push({
        category: 'Veterans Affairs Facilities',
        selection: 'Results limited to trials at Veterans Affairs facilities',
      });
    }

    if (healthyVolunteers) {
      criteria.push({
        category: 'Healthy Volunteers',
        selection: 'Results limited to trials accepting healthy volunteers',
      });
    }

    if (trialTypes) {
      let joinedVals = [];
      trialTypes.forEach(function(trialType) {
        if (trialType.checked) {
          joinedVals.push(trialType.label);
        }
      });
      if (joinedVals.length > 0 && joinedVals.length !== trialTypes.length) {
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

    if (trialId && trialId !== '') {
      criteria.push({ category: 'Trial ID', selection: trialId });
    }

    if (trialPhases) {
      let joinedVals = [];
      trialPhases.forEach(function(phase) {
        if (phase.checked === true) {
          joinedVals.push(phase.label);
        }
      });
      if (joinedVals.length > 0 && joinedVals.length < trialPhases.length) {
        criteria.push({
          category: 'Trial Phase',
          selection: joinedVals.join(', '),
        });
      }
    }

    if (investigator && investigator.term !== '') {
      criteria.push({
        category: 'Trial Investigators',
        selection: investigator.term,
      });
    }

    if (leadOrg && leadOrg.term !== '') {
      criteria.push({
        category: 'Lead Organizations',
        selection: leadOrg.term,
      });
    }

    setCriterion([...criteria]);
  };

  return criterion.length ? (
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
  ) : null;
};

export default SearchCriteriaTable;
