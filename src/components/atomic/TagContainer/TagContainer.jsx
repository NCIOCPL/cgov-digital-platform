import React from 'react';
import PropTypes from 'prop-types';
import './TagContainer.scss';

const TagContainer = ({
  children
}) => {
  return (
    <div className="cts-tag-container">
      { children }
    </div>
  );
};

TagContainer.propTypes = {
  children: PropTypes.node
};

TagContainer.defaultProps = {
  children: <></>
};

export default TagContainer;
