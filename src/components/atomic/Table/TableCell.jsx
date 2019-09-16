import React from 'react';
import PropTypes from 'prop-types';

const TableCell = ({ children, ...otherProps }) => (
  <td {...otherProps}>{children}</td>
);

TableCell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TableCell;
