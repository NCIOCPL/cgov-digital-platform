import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Utilities from '../../../utilities/utilities';
import './Pager.scss';

const Pager = ({ data, startFromPage, numberToShow, callback }) => {
  const [currentPage, setCurrentPage] = useState(startFromPage);

  useEffect(() => {
    if (callback) {
      // originally, this assumed that the data comes back as a huge block, in CTS case, each results set is a distinct block
      // const startFrom = currentPage * numberToShow;
      // const endAt = startFrom + numberToShow;
      // const results = data.slice(startFrom, endAt);
      const results = data;
      callback(results, currentPage);
    }
    //document.querySelector('.pager__num--active').focus();
  }, [currentPage, data, numberToShow]);

  useEffect(() => {
    setCurrentPage(startFromPage);
  }, [startFromPage])

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
    const pagesFromEnd = divisions - (activePage + 1);
    let pages;
    if (divisions > 1) {
      if (pagesFromStart > 3) {
        pages = [0, renderEllipsis, activePage - 1, activePage];
      } else {
        pages = Array(activePage + 1)
          .fill()
          .map((el, idx) => idx);
      }
      if (pagesFromEnd > 3) {
        pages = [
          ...pages,
          activePage + 1,
          renderEllipsis,
          divisions - 1,
        ];
      } else {
        const remainingPages = Array(pagesFromEnd)
          .fill()
          .map((el, idx) => activePage + 1 + idx);
        pages = [...pages, ...remainingPages];
      }
    } else {
      //One or fewer divisions exist. Do not render the Pager
      pages = [];
    }
    return pages;
  };

  const determineResults = pageNumber => {
    setCurrentPage(pageNumber);
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
  let isLastPage = currentPage + 1 === Math.ceil(data.length / numberToShow);
  return (
    <nav className="pager__container">
      {steps.length > 0 ? (
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
              {'< Previous'}
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
              {'Next >'}
            </div>
          )}
        </div>
      ) : null}
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
