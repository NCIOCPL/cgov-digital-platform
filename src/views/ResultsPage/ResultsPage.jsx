import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateForm, clearForm } from '../../store/actions';
import { Delighter, Checkbox, Modal, Pager } from '../../components/atomic';
import {
  formatTrialSearchQuery,
  buildQueryString,
} from '../../utilities/utilities';
import { useModal } from '../../utilities/hooks';
import ResultsPageHeader from './ResultsPageHeader';
import ResultsList from './ResultsList';
import { searchTrials } from '../../store/actions';
import { history } from '../../services/history.service';
import PrintModalContent from './PrintModalContent';
import './ResultsPage.scss';
const queryString = require('query-string');

const ResultsPage = ({ location }) => {
  const dispatch = useDispatch();
  const [selectAll, setSelectAll] = useState(false);
  const [pagerPage, setPagerPage] = useState(0);
  const [selectedResults, setSelectedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trialResults, setTrialResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);

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
    } else if (!formSnapshot.hasInvalidZip) {
      //data isn't there, fetch it
      fetchTrials(qs);
    } else {
      setIsLoading(false);
    }
  }, []);

  //when trial results come in, open up shop
  useEffect(() => {
    if (isLoading && cacheLookup && cacheLookup.total >= 0) {
      initData();
    }
  }, [cacheLookup]);

  //track usage of selected results for print
  useEffect(() => {
    if (selectedResults.length >= 100) {
      toggleModal();
    }
  }, [selectedResults]);

  const initData = () => {
    window.scrollTo(0, 0);
    setSelectAll(false);
    setIsLoading(false);
    setTrialResults(cacheLookup);
    setResultsCount(cacheLookup.total);
  };

  const fetchTrials = queryKey => {
    setIsLoading(true);
    history.replace({
      path: '/about-cancer/treatment/clinical-trials/search/r',
      search: qs,
    });
    cacheLookup = cache[queryKey];
    dispatch(
      searchTrials({
        cacheKey: queryKey,
        data: formatTrialSearchQuery(formData),
      })
    );
  };

  const handleSelectAll = () => {
    const pageResultIds = [
      ...new Set(trialResults.trials.map(item => item.nciID)),
    ];
    if (!selectAll) {
      setSelectAll(true); // toggle the box then check all the trial results boxes
      setSelectedResults([...new Set([...selectedResults, ...pageResultIds])]);
    } else {
      setSelectAll(false);
      setSelectedResults(
        selectedResults.filter(item => !pageResultIds.includes(item))
      );
    }
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
      <>
        {resultsCount > 0 ? (
          <div
            className={`results-page__control ${
              isBottom ? '--bottom' : '--top'
            }`}
          >
            <div className="results-page__select-all">
              <Checkbox
                id={cbxId}
                name="select-all"
                label="Select all on page"
                checked={selectAll}
                classes="check-all"
                onChange={handleSelectAll}
              />
              <button
                className="results-page__print-button"
                ref={printSelectedBtn}
                onClick={handlePrintSelected}
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
        ) : null}
      </>
    );
  };

  const handlePrintSelected = () => {
    toggleModal();
  };

  const renderInvalidZip = () => {
    return (
      <div className="results-list invalid-zip">
        <p>
          Sorry you seem to have entered invalid criteria. Please check the
          following, and try your search again:
        </p>
        <ul>
          <li>Zip Code</li>
        </ul>
        <p>
          For assistance, please contact the NCI Contact Center. You can{' '}
          <a href="/contact" className="live-help-link">
            chat online
          </a>{' '}
          or call 1-800-4-CANCER (1-800-422-6237).
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

  const renderNoResults = () => {
    return (
      <div className="results-list no-results">
        <p>
          <strong>No clinical trials matched your search.</strong>
        </p>
        <p>
          For assistance, please contact the NCI Contact Center. You can{' '}
          <a href="/contact" className="live-help-link">
            chat online
          </a>{' '}
          or call 1-800-4-CANCER (1-800-422-6237).
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
        <h1>Clinical Trials Search Results</h1>
        {isLoading ? (
          <>Loading...</>
        ) : formSnapshot.hasInvalidZip ? (
          <>{renderInvalidZip()}</>
        ) : (
          <>
            <ResultsPageHeader
              resultsCount={resultsCount}
              pageNum={pagerPage}
              handleUpdate={handleUpdate}
              handleReset={handleStartOver}
            />
            <div className="results-page__content">
              {renderControls()}
              <div className="results-page__list">
                {trialResults && trialResults.total === 0 ? (
                  <>{renderNoResults()}</>
                ) : (
                  <ResultsList
                    results={trialResults.trials}
                    selectedResults={selectedResults}
                    setSelectedResults={setSelectedResults}
                    setSelectAll={setSelectAll}
                  />
                )}
                <aside className="results-page__aside --side">
                  {renderDelighters()}
                </aside>
              </div>

              {renderControls(true)}
            </div>
          </>
        )}

        <aside className="results-page__aside --bottom">
          {renderDelighters()}
        </aside>
      </article>
      <Modal isShowing={isShowing} hide={toggleModal}>
        <PrintModalContent
          selectedList={selectedResults}
          handleClose={toggleModal}
        />
      </Modal>
    </>
  );
};

export default ResultsPage;
