import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Utilities from '../../../utilities/utilities';
import './Pager.scss';

const Pager = ({ data, startFromPage, numberToShow, callback }) => {
  const [currentPage, setCurrentPage] = useState(startFromPage);

  const renderEllipsis = key => {
    return (
      <div key={key} tabIndex="-1" className="pager__num pager__ellipses">
        {'...'}
      </div>
    );
  };

  const determineSteps = (total, numberToShow, activePage) => {
    const divisions = Math.ceil(total / numberToShow);
    const pagesFromStart = activePage;
    const pagesFromEnd = divisions - activePage;
    let pages;
    if (pagesFromStart > 5) {
      pages = [0, renderEllipsis, activePage - 2, activePage - 1, activePage];
    } else {
      pages = Array(activePage + 1)
        .fill()
        .map((el, idx) => idx);
    }
    if (pagesFromEnd > 5) {
      pages = [
        ...pages,
        activePage + 1,
        activePage + 2,
        renderEllipsis,
        divisions,
      ];
    } else {
      const remainingPages = Array(pagesFromEnd + 1)
        .fill()
        .map((el, idx) => activePage + 1 + idx);
      pages = [...pages, ...remainingPages];
    }
    return pages;
  };

  const determineResults = pageNumber => {
    setCurrentPage(pageNumber);
    if (callback) {
      const startFrom = pageNumber * numberToShow;
      const endAt = startFrom + numberToShow;
      const results = data.slice(startFrom, endAt);
      callback(results);
    }
  };

  const renderSteps = (stepsArray, activePage) => {
    return stepsArray.map((currentStep, idx) => {
      if (typeof currentStep === 'function') {
        return currentStep(idx);
      } else {
        const isCurrent = currentStep.toString() === activePage.toString();
        return (
          <div
            key={idx}
            tabIndex="0"
            className={`pager__num ${isCurrent ? 'pager__num--active' : ''}`}
            onClick={!isCurrent ? () => determineResults(currentStep) : null}
            onKeyPress={Utilities.keyHandler({
              fn: !isCurrent ? () => determineResults(currentStep) : null,
            })}
          >
            {currentStep + 1}
          </div>
        );
      }
    });
  };

  let steps = determineSteps(data.length, numberToShow, currentPage);
  let isFirstPage = currentPage === 0;
  let isLastPage = currentPage === Math.ceil(data.length / numberToShow) + 1;
  return (
    <nav className="pager__container">
      <div className="pager__nav">
        {!isFirstPage && (
          <div
            className="pager__arrow"
            tabIndex="0"
            onClick={() => determineResults(currentPage - 1)}
            onKeyPress={Utilities.keyHandler({
              fn: () => determineResults(currentPage - 1),
            })}
          >
            {'<'}
          </div>
        )}
        {renderSteps(steps, currentPage)}
        {!isLastPage && (
          <div
            className="pager__arrow"
            tabIndex="0"
            onClick={() => determineResults(currentPage + 1)}
            onKeyPress={Utilities.keyHandler({
              fn: () => determineResults(currentPage + 1),
            })}
          >
            {'>'}
          </div>
        )}
      </div>
    </nav>
  );
};

Pager.propTypes = {
  data: PropTypes.array,
  startFromPage: PropTypes.number,
  numberToShow: PropTypes.number,
  callback: PropTypes.func.isRequired,
};

Pager.defaultProps = {
  data: [],
  startFromPage: 0,
  numberToShow: 10,
};

export default Pager;
