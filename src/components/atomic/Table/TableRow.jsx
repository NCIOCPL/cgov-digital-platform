import React from 'react';
import PropTypes from 'prop-types';
import './Table.scss';

const TableRow = ({ children, ...otherProps }) => (
  <tr {...otherProps}>{children}</tr>
);

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TableRow;
