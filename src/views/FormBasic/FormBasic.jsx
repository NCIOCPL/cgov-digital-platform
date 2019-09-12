import React from 'react';
import PropTypes from 'prop-types';

//modules
import {
  Age,
  CancerTypeKeyword,
  ZipCode,
} from '../../components/search-modules/';

const FormBasic = () => {
  const handleSubmit = e => {
    e.preventDefault();
    console.log('form submitted');
  };

  return (
    <form onSubmit={handleSubmit} className="search-page__form advanced">
      <CancerTypeKeyword />
      <Age />
      <ZipCode />
    </form>
  );
};

FormBasic.propTypes = {
};

FormBasic.defaultProps = {
};

export default FormBasic;
