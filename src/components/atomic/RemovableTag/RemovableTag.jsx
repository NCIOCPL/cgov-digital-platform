import React from 'react';
import PropTypes from 'prop-types';
import './RemovableTag.scss';

const RemovableTag = ({
  label,
  onRemove
}) => {
  const handleClick = (e) => {
    console.log('remove');
    onRemove();
  }

  return (
    <div className="cts-removable-tag">
      <button className="cts-removable-tag__button" type="button" aria-label={`remove ${label}`} onClick={handleClick}><span aria-hidden="true">X</span></button>
      <span className="cts-removable-tag__label">{label}</span>
    </div>
  );
};

RemovableTag.propTypes = {
  label: PropTypes.string,
  onRemove: PropTypes.func
};

RemovableTag.defaultProps = {
  onRemove: () => {}
};

export default RemovableTag;
