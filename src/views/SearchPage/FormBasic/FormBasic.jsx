import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';

//modules
import {
  Age,
  CancerTypeKeyword,
  ZipCode,
} from '../../../components/search-modules/';


const FormBasic = submitFn => {
  const [redirectToResults, setRedirectToResults] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setRedirectToResults(true);
  }

  if (redirectToResults) {
    return <Redirect push to="/r" />;
  }


  return (
    <form onSubmit={handleSubmit} className="search-page__form advanced">
      <CancerTypeKeyword />
      <Age />
      <ZipCode />
      <div className="submit-block">
        <button type="submit" className="btn-submit">
          Find Trials
        </button>
      </div>
    </form>
  );
};

FormBasic.propTypes = {
  submitFn: PropTypes.func,
};

FormBasic.defaultProps = {
  submitFn: () => {},
};

export default FormBasic;
