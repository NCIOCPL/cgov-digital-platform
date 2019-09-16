import React from 'react';
import PropTypes from 'prop-types';

const TableHeaderCell = ({ children, ...otherProps }) => (
  <th {...otherProps}>{children}</th>
);

TableHeaderCell.propTypes = {
  scope: PropTypes.oneOf(['col', 'row']).isRequired,
  children: PropTypes.node.isRequired,
};

TableHeaderCell.defaultProps = {
  scope: 'row',
};

export default TableHeaderCell;
