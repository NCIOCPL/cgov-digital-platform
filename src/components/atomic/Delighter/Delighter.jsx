import React from 'react';
import PropTypes from 'prop-types';
import './Delighter.scss';

const Delighter = ({
  classes,
  children,
  url,
  titleText
}) => (
  <div className={`delighter ${classes}`}>
    <a href={url}>
        <h4>{titleText}</h4>
        {children}
    </a>
  </div>
);

Delighter.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
  url: PropTypes.string,
  titleText: PropTypes.node
};

Delighter.defaultProps = {
  children: '',
  classes: '',
  url: '',
  titleText: ''
};

export default Delighter;
