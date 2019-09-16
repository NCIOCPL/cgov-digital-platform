import React from 'react';
import PropTypes from 'prop-types';
import TableHeaderCell from './TableHeaderCell';
import TableRow from './TableRow';
import TableCell from './TableCell';

import './Table.scss';

const Table = ({ columns, borderless, caption, data, children }) => {
  //  Generates the table header cells
  //  @returns {node} <th> elements

  const renderHeaders = () => {
    // Loop over the props.columns array
    return columns.map((column, index) => {
      // if each item in the array is a string, then use that inside the <th>
      if (typeof column === 'string') {
        return (
          <TableHeaderCell scope="col" key={index}>
            {column}
          </TableHeaderCell>
        );
        // else expect an object.
        // Use object.displayName for the <th> text or colId is displayName is not provided
      } else {
        let { colId, displayName } = column;
        return (
          <TableHeaderCell scope="col" key={index}>
            {displayName || colId}
          </TableHeaderCell>
        );
      }
    });
  };

  //  Renders the table rows if data is passed in
  //  @param {array} data from props.data
  //  @returns {node} rendered DOM node (<tr><td>...</tr>)
  const renderRows = data => {
    // Loop over the data array
    return data.map((datum, rowKey) => {
      // Loop over columns array to get the colIds
      const cells = columns.map(({ colId }, key) => {
        // if it's the first cell in the row, make it a <th>
        if (key === 0) {
          return (
            <TableHeaderCell scope="row" key={key}>
              {datum[colId]}
            </TableHeaderCell>
          );
          // else make it a <td>
        } else {
          return <TableCell key={key}>{datum[colId]}</TableCell>;
        }
      });
      // return a row with all the cells for each item in columns array
      return <TableRow key={rowKey}>{cells}</TableRow>;
    });
  };

  return (
    <table className={`cts-table ${borderless ? 'cts-table--borderless' : ''}`}>
      {caption ? <caption>{caption}</caption> : null}

      <thead>
        <tr>{renderHeaders()}</tr>
      </thead>

      <tbody>{data ? renderRows(data) : children}</tbody>
    </table>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  borderless: PropTypes.bool,
  caption: PropTypes.string,
  data: PropTypes.array,
  children: PropTypes.node,
};

Table.defaultProps = {
  borderless: false,
};

export default Table;
