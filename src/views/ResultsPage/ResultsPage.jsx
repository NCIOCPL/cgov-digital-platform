import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateForm, clearForm } from '../../store/actions';
import { Delighter, Checkbox, Modal, Pager } from '../../components/atomic';
import {
  formatTrialSearchQuery,
  buildQueryString,
} from '../../utilities/utilities';
import { useModal, useQueryString } from '../../utilities/hooks';
import ResultsPageHeader from './ResultsPageHeader';
import ResultsList from './ResultsList';
import { searchTrials } from '../../store/actions';
import { history } from '../../services/history.service';
import './ResultsPage.scss';
const queryString = require('query-string');

const ResultsPage = ({ location }) => {
  const dispatch = useDispatch();
  const [selectAll, setSelectAll] = useState(false);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [pagerPage, setPagerPage] = useState(0);
  const [selectedResults, setSelectedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trialResults, setTrialResults] = useState();

  const formSnapshot = useSelector(store => store.form);
  const [formData, setFormData] = useState(formSnapshot);

  const qs = queryString.stringify(buildQueryString(formSnapshot));
  const [query, setQuery] = useState(qs);

  const cache = useSelector(store => store.cache);
  var cacheLookup = cache[query];

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if (trialResults && trialResults.total >= 0) {
      initData();
    } else {
      //data isn't there, fetch it
      history.replace({
        path: '/about-cancer/treatment/clinical-trials/search/r',
        search: qs,
      });
      fetchTrials(qs);
    }
  }, []);

  // select all
  useEffect(() => {
    if (selectedResults.length === 0) {
      setSelectAll(false);
    } else if (paginatedResults.length === selectedResults.length) {
      setSelectAll(true);
    }
  }, [paginatedResults, selectedResults]);

  //when trial results come in, open up shop
  useEffect(() => {
    if (isLoading && cacheLookup && cacheLookup.total >= 0) {
      initData();
    }
  }, [cacheLookup]);

  const initData = () => {
    setIsLoading(false);
    setTrialResults(cacheLookup);
  };

  const fetchTrials = queryKey => {
    setIsLoading(true);
    cacheLookup = cache[queryKey];
    dispatch(
      searchTrials({
        cacheKey: queryKey,
        data: formatTrialSearchQuery(formData),
      })
    );
  };

  const handleStartOver = () => {
    dispatch(clearForm());
  };
  const handleUpdate = (field, value) => {
    dispatch(
      updateForm({
        field,
        value,
      })
    );
  };

  // setup print Modal
  const { isShowing, toggleModal } = useModal();
  const printSelectedBtn = useRef(null);

  const handlePagination = currentPage => {
    if (currentPage !== pagerPage) {
      // set currentPage and kick off fetch
      setPagerPage(currentPage);
      let tmpForm = formData;
      tmpForm.resultsPage = parseInt(currentPage);
      setFormData(tmpForm);
      // update qs
      const parsed = queryString.parse(location.search);
      parsed.pn = currentPage + 1;
      let newqs = queryString.stringify(parsed);
      setQuery(newqs);
      history.push({
        search: newqs,
      });
      fetchTrials(newqs);
    }
  };

  const renderDelighters = () => (
    <div className="cts-delighter-container">
      <Delighter
        classes="cts-livehelp"
        url="/contact"
        titleText={
          <>
            Have a question?
            <br />
            We're here to help
          </>
        }
      >
        <p>
          <strong>Chat with us:</strong> LiveHelp
          <br />
          <strong>Call us:</strong> 1-800-4-CANCER
          <br />
          (1-800-422-6237)
        </p>
      </Delighter>

      <Delighter
        classes="cts-which"
        url="/about-cancer/treatment/clinical-trials/search/trial-guide"
        titleText={<>Which trials are right for you?</>}
      >
        <p>
          Use the checklist in our guide to gather the information you’ll need.
        </p>
      </Delighter>
    </div>
  );

  const renderControls = (isBottom = false) => {
    const cbxId = isBottom ? 'select-all-cbx-bottom' : 'select-all-cbx-top';
    return (
      <div
        className={`results-page__control ${isBottom ? '--bottom' : '--top'}`}
      >
        <div className="results-page__select-all">
          <Checkbox
            id={cbxId}
            name="select-all"
            label="Select all on page"
            checked={selectAll}
            classes="check-all"
            onChange={() => setSelectAll(!selectAll)}
          />
          <button
            className="results-page__print-button"
            ref={printSelectedBtn}
            onClick={toggleModal}
          >
            Print Selected
          </button>
        </div>
        <div className="results-page__pager">
          {trialResults && trialResults.total > 1 && (
            <Pager
              data={trialResults.trials}
              callback={handlePagination}
              startFromPage={pagerPage}
              totalItems={trialResults.total}
            />
          )}
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    if (selectedResults.length === 0) {
      return (
        <>
          <div className="icon-warning" aria-hidden="true">
            !
          </div>
          <p>
            You have not selected any trials. Please select at least one trial
            to print.
          </p>
        </>
      );
    } else {
      return (
        <>
          <div className="spinkit spinner">
            <div className="dot1"></div>
            <div className="dot2"></div>
          </div>
          <p>
            You will automatically be directed to your print results in just a
            moment...
          </p>
        </>
      );
    }
  };

  const renderNoResults = () => {
    return (
      <div className="results-list no-results">
        <p>
          <strong>No clinical trials matched your search.</strong>
        </p>
        <p>
          For assistance, please contact the NCI Contact Center. You can chat
          online or call 1-800-4-CANCER (1-800-422-6237).
        </p>
        <p>
          <Link
            to={`/about-cancer/treatment/clinical-trials/search${
              formSnapshot.formType === 'basic' ? '' : '/advanced'
            }`}
            onClick={handleStartOver}
          >
            Try a new search
          </Link>
        </p>
      </div>
    );
  };

  return (
    <>
      <article className="results-page">
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>
            <ResultsPageHeader
              resultsCount={trialResults.total}
              pageNum={pagerPage}
              handleUpdate={handleUpdate}
              handleReset={handleStartOver}
            />
            <div className="results-page__content">
              {trialResults.total === 0 ? null : renderControls()}
              <div className="results-page__list">
                {trialResults && trialResults.total === 0 ? (
                  <>{renderNoResults()}</>
                ) : (
                  <ResultsList
                    results={trialResults.trials}
                    selectedResults={selectedResults}
                    setSelectedResults={setSelectedResults}
                  />
                )}
                <aside className="results-page__aside --side">
                  {renderDelighters()}
                </aside>
              </div>

              {trialResults.total === 0 ? null : renderControls(true)}
            </div>
          </>
        )}

        <aside className="results-page__aside --bottom">
          {renderDelighters()}
        </aside>
      </article>
      <Modal isShowing={isShowing} hide={toggleModal}>
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default ResultsPage;
