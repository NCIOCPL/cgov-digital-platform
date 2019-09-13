import React from 'react';
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

export default FormBasic;
