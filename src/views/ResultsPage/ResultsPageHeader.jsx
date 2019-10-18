import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useCachedValues } from '../../utilities/hooks';
import { getMainType, getCancerTypeDescendents } from '../../store/actions';
import { Link } from 'react-router-dom';
import { SearchCriteriaTable } from '../../components/atomic';
import { history } from '../../services/history.service';

const ResultsPageHeader = ({ handleUpdate, resultsCount }) => {
  const dispatch = useDispatch();
  const { formType, cancerType, age, zip, keywordPhrases } = useSelector(store => store.form);
  const {
    maintypeOptions = [],
  } = useCachedValues([
    'maintypeOptions',
  ]);

  const handleRefineSearch = () => {
    if (formType === 'basic') {
      //prefetch stuff
      if (maintypeOptions.length < 1) {
        dispatch(getMainType({}));
      }
      if(cancerType.name !== '') {
        handleUpdate('cancerTypeModified', true);
      }
      if (age !== ''){
        handleUpdate('ageModified', true);
      }
      if(zip !== ''){
        handleUpdate('zipModified', true);
      }
      if(keywordPhrases !== ''){
        handleUpdate('keywordPhrasesModified', true);
      }
      handleUpdate('formType', 'advanced');
    }
    handleUpdate('refineSearch', true);
    history.push('/search');
  };

  return (
    <div className="cts-results-header">
      <p>
        <strong>Results 1-10 of {resultsCount} for your search</strong>
      </p>

      <SearchCriteriaTable />
      <p className="reset-form">
        <Link to="/search">Start Over</Link>
        <span aria-hidden="true" className="separator">
          |
        </span>
        <button
          type="button"
          className="btnAsLink"
          onClick={handleRefineSearch}
        >
          Modify Search Criteria
        </button>
      </p>
    </div>
  );
};

ResultsPageHeader.propTypes = {
  resultsCount: PropTypes.string,
};

export default ResultsPageHeader;
