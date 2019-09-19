import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Delighter } from '../../components/atomic';
import {
  CancerTypeCondition,
  Age,
  KeywordsPhrases,
  Location,
  TrialType,
  DrugTreatment,
  TrialPhase,
  TrialId,
  TrialInvestigators,
  LeadOrganization,
  CancerTypeKeyword,
  ZipCode,
} from '../../components/search-modules';
import { updateForm } from '../../store/actions';

//Module groups in arrays will be placed side-by-side in the form
const basicFormModules = [Age, CancerTypeKeyword, ZipCode];
const advancedFormModules = [
  CancerTypeCondition,
  [Age, KeywordsPhrases],
  Location,
  TrialType,
  DrugTreatment,
  TrialPhase,
  TrialId,
  TrialInvestigators,
  LeadOrganization,
];

const useValue = (prop) => useSelector(({search}) => search[prop]);

const SearchPage = ({ form }) => {
  const dispatch = useDispatch();
  const [formVersion, setFormVersion] = useState(form);
  const [redirectToResults, setRedirectToResults] = useState(false);

  useEffect(() => {
    if (redirectToResults) {
      return <Redirect push to="/r" />;
    }
  }, [redirectToResults]);

  const handleSubmit = e => {
    e.preventDefault();
    setRedirectToResults(true);
  };

  const handleUpdate = e => {
    console.log('e: ', e.target.name, e.target.value);
    dispatch(
      updateForm({
        field: e.target.name,
        value: e.target.value,
      })
    );
  };

  const renderDelighters = () => (
    <div className="cts-delighter-container">
      <Delighter
        classes="cts-livehelp"
        url="/contact"
        titleText={
          <>
            Have a question?
            <br />
            We're here to help
          </>
        }
      >
        <p>
          <strong>Chat with us:</strong> LiveHelp
          <br />
          <strong>Call us:</strong> 1-800-4-CANCER
          <br />
          (1-800-422-6237)
        </p>
      </Delighter>

      <Delighter
        classes="cts-what"
        url="/about-cancer/treatment/clinical-trials/what-are-trials"
        titleText={<>What Are Cancer Clinical Trials?</>}
      >
        <p>Learn what they are and what you should know about them.</p>
      </Delighter>

      <Delighter
        classes="cts-which"
        url="/about-cancer/treatment/clinical-trials/search/trial-guide"
        titleText={<>Which trials are right for you?</>}
      >
        <p>
          Use the checklist in our guide to gather the information you’ll need.
        </p>
      </Delighter>
    </div>
  );

  const toggleForm = () => {
    setFormVersion(formVersion === 'basic' ? 'advanced' : 'basic');
  };

  const renderSearchTip = () => (
    <div className="cts-search-tip">
      <div className="cts-search-tip__icon">
        <i className="lightbulb-circle-yellow"></i>
      </div>
      <div className="cts-search-tip__body">
        <strong>Search Tip:</strong>
        {formVersion === 'basic' ? (
          <>{` For more search options, use our `}</>
        ) : (
          <>{` All fields are optional. Skip any items that are unknown or not applicable or try our `}</>
        )}
        <button type="button" onClick={toggleForm}>
          {formVersion === 'basic' ? 'advanced search' : 'basic search'}
        </button>
        .
      </div>
    </div>
  );

  let formModules = formVersion === 'advanced' ? advancedFormModules : basicFormModules;

  return (
    <div className="general-page-body-container">
      <div className="contentzone">
        {/* */}
        <article className="search-page">
          <div className="search-page__header">
            <p>
              NCI-supported clinical trials are those sponsored or otherwise
              financially supported by NCI. See our guide, Steps to Find a
              Clinical Trial, to learn about options for finding trials not
              included in NCI's collection.
            </p>
            {renderSearchTip()}
          </div>

          <div className="search-page__content">
            <form
              onSubmit={handleSubmit}
              className={`search-page__form ${formVersion}`}
            >
              {formModules.map((Module, idx) => {
                if (Array.isArray(Module)) {
                  return (
                    <div key={`formAdvanced-${idx}`} className="side-by-side">
                      {Module.map((Mod, i) => (
                        <Mod
                          key={`formAdvanced-${idx}-${i}`}
                          handleUpdate={handleUpdate}
                          useValue={useValue}
                        />
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <Module
                      key={`formAdvanced-${idx}`}
                      handleUpdate={handleUpdate}
                      useValue={useValue}
                    />
                  );
                }
              })}
              <div className="submit-block">
                <button type="submit" className="btn-submit">
                  Find Trials
                </button>
              </div>
            </form>
            <aside className="search-page__aside">{renderDelighters()}</aside>
          </div>

          <div className="search-page__footer">
            <div className="api-reference-section">
              <h3 id="ui-id-4">
                The Clinical Trials API: Use our data to power your own clinical
                trial search
              </h3>
              <p className="api-reference-content">
                An application programming interface (API) helps translate large
                amounts of data in meaningful ways. NCI’s clinical trials search
                data is now powered by an API, allowing programmers to build
                applications{' '}
                <a href="/syndication/api">using this open data.</a>
              </p>
            </div>
          </div>
        </article>
        {/* */}
      </div>
    </div>
  );
};

SearchPage.propTypes = {
  form: PropTypes.string,
};

SearchPage.defaultProps = {
  form: 'advanced',
};

export default SearchPage;
