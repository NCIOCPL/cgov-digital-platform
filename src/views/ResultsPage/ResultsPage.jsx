import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateForm } from '../../store/actions';
import {
  Delighter,
  Checkbox,
  Modal,
  Pager,
  ResultsList,
} from '../../components/atomic';
import { useModal } from '../../utilities/hooks';
import './ResultsPage.scss';
import ResultsPageHeader from './ResultsPageHeader';

const ResultsPage = ({ results }) => {
  const dispatch = useDispatch();
  const [selectAll, setSelectAll] = useState(false);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [pagerPage, setPagerPage] = useState(0);
  const [selectedResults, setSelectedResults] = useState([]);

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //manage Pager Results
  useEffect(() => {
    if (selectAll) {
      setSelectedResults([...paginatedResults.map(result => result.title)]);
    } else {
      setSelectedResults([]);
    }
  }, [selectAll, setSelectedResults, paginatedResults]);

  // update selected results for Print
  useEffect(() => {
    setSelectedResults([]);
  }, [paginatedResults]);

  // select all
  useEffect(() => {
    if (selectedResults.length === 0) {
      setSelectAll(false);
    } else if (paginatedResults.length === selectedResults.length) {
      setSelectAll(true);
    }
  }, [paginatedResults, selectedResults]);

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

  const handlePagination = (slicedResults, currentPage) => {
    setPaginatedResults([...slicedResults]);
    setPagerPage(currentPage);
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
          <Pager
            data={results}
            callback={handlePagination}
            startFromPage={pagerPage}
          />
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

  return (
    <>
      <article className="results-page">
        <ResultsPageHeader
          resultsCount={paginatedResults.length}
          handleUpdate={handleUpdate}
        />
        <div className="results-page__content">
          {renderControls()}
          <div className="results-page__list">
            <ResultsList
              results={paginatedResults}
              selectedResults={selectedResults}
              setSelectedResults={setSelectedResults}
            />
            <aside className="results-page__aside --side">
              {renderDelighters()}
            </aside>
          </div>
          {renderControls(true)}
        </div>
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
