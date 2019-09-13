import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Utilities from '../../../utilities/utilities';
import './Pager.scss';

const Pager = ({
  data,
  startFromPage,
  numberToShow,
  callback
}) => {
  const [currentPage, setCurrentPage] = useState(startFromPage);
  const determineSteps = (data, numberToShow) => {
    //Round up to catch remainders
    let divisions = Math.ceil(data.length / numberToShow);
    console.log('divisions: ', divisions);
    return [...Array(divisions).keys()]
  }

  const renderSteps = (stepsArray) => {
    console.log('stepsArray: ', stepsArray);
    return stepsArray.map((pageNumber, idx) => {
      const isCurrent = pageNumber === currentPage;
      return (
        <div 
          key={ idx }
          tabIndex="0"
          className={ `pager__num ${ isCurrent ? 'pager__num--active' : ''}`}
          onClick={ !isCurrent ? () => returnResults(pageNumber) : null }
          onKeyPress={ Utilities.keyHandler({
            fn: !isCurrent ? () => returnResults(pageNumber) : null,
          })}
        >{ pageNumber }</div>
      )
    })
  }

  return (
    <div className="pager">
      {
        data.length > 0
          ? renderSteps(determineSteps(data, numberToShow))
          : null
      }
    </div>
  );
};

Pager.propTypes = {
  data: PropTypes.array,
  startFromPage: PropTypes.number,
  numberToShow: PropTypes.number,
  callback: PropTypes.func.isRequired
};

Pager.defaultProps = {
  data: [],
  startFromPage: 0,
  numberToShow: 10
};

export default Pager;
