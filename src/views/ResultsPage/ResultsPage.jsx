import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Checkbox,
  ResultsList,
  Delighter,
  Pager,
  Accordion,
  AccordionItem,
} from '../../components/atomic';
import './ResultsPage.scss';

const ResultsPage = ({ results }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [pagerPage, setPagerPage] = useState(0);
  const [selectedResults, setSelectedResults] = useState([]);

  useEffect(() => {
    if (selectAll) {
      setSelectedResults([...paginatedResults.map(result => result.title)]);
    } else {
      setSelectedResults([]);
    }
  }, [selectAll]);

  useEffect(() => {
    setSelectedResults([]);
  }, [paginatedResults]);

  useEffect(() => {
    if (selectedResults.length === 0) {
      setSelectAll(false);
    } else if (paginatedResults.length === selectedResults.length) {
      setSelectAll(true);
    }
  }, [paginatedResults, selectedResults]);

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

  const renderResultsHeader = () => {
    return (
      <div className="cts-results-header">
        <p>
          <strong>
            Results 1-10 of {paginatedResults.length} for your search
          </strong>
        </p>
        <Accordion bordered startCollapsed>
          <AccordionItem title="Show Search Criteria">
            <div>
              <h3>Your Search Criteria</h3>
              ...Table here...
            </div>
          </AccordionItem>
        </Accordion>
        <p className="reset-form">
          <Link to="/search">Start Over</Link>
        </p>
      </div>
    );
  };

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
            label="Select All on Page"
            checked={selectAll}
            hideLabel
            onChange={() => setSelectAll(!selectAll)}
          />
          <button className="results-page__print-button">Print Selected</button>
        </div>
        <div className="results-page__pager">
          <Pager data={results} callback={handlePagination} startFromPage={pagerPage} />
        </div>
      </div>
    );
  };

  return (
    <div className="general-page-body-container main-content">
      <div className="contentzone">
        {/* */}
        <article className="results-page">
          {renderResultsHeader()}
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
        {/* */}
      </div>
    </div>
  );
};

ResultsPage.propTypes = {
  results: PropTypes.array,
};

ResultsPage.defaultProps = {
  results: [],
};

export default ResultsPage;
