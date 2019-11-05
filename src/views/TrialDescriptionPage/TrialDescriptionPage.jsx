import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTrial, receiveData } from '../../store/actions';
import {
  Accordion,
  AccordionItem,
  Delighter,
  TrialStatusIndicator,
  Table,
} from '../../components/atomic';
import SitesList from './SitesList';
import { getMockTrial } from '../../mocks/mock-trial-description';

import './TrialDescriptionPage.scss';

const TrialDescriptionPage = form => {
  const dispatch = useDispatch();
  //const { cache } = useSelector(store => store.cache['NCI-2018-03587']);
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const trial = getMockTrial();
  

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(getTrial({ trialId: 'NCI-2015-00054' }));
  }, [dispatch]);

  const updateCache = (value) => {
    dispatch(
      receiveData({
        cacheKey: 'NCI-2015-00054', 
        value
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

  const renderTrialDescriptionHeader = () => {
    return (
      <div className="trial-description-page__header">
        <h1>{trial.brief_title}</h1>
        <div className="back-to-search">
          <Link to="/r">&lt; Back to search results</Link>
        </div>

        <div>
          This clinical trial matches: "all trials" |{' '}
          <button className="btnAsLink">Start Over</button>
        </div>
      </div>
    );
  };

  return (
    <div id="main-content" className="general-page-body-container main-content">
      <div className="contentzone">
        {isTrialLoading ? (
          <div>Loading</div>
        ) : (
          <article className="trial-description-page">
            {renderTrialDescriptionHeader()}

            <div className="trial-description-page__description">
              <div className="trial-description-page__content">
                <TrialStatusIndicator
                  status={trial.current_trial_status.toLowerCase()}
                />
                <Accordion>
                  <AccordionItem titleCollapsed="Description" expanded>
                    {trial.brief_summary}
                  </AccordionItem>
                  <AccordionItem titleCollapsed="Eligibility Criteria">
                    {trial.eligibility.unstructured[0].description}
                  </AccordionItem>
                  <AccordionItem titleCollapsed="Locations &amp; Contacts">
                    <SitesList sites={trial.sites} />
                  </AccordionItem>
                  <AccordionItem titleCollapsed="Trial Objectives and Outline">
                    {trial.detail_description}
                  </AccordionItem>
                  <AccordionItem titleCollapsed="Trial Phase &amp; Type">
                    <Table
                      borderless
                      columns={[{
                        colId: 'phase',
                        displayName: 'Trial Phase',
                      },
                      {
                        colId: 'type',
                        displayName: 'Trial Type',
                      }]}
                      data={[
                        {
                          phase: `Phase ${trial.phase.phase}`, 
                          type: trial.primary_purpose.primary_purpose_code
                        }
                      ]} />
                  </AccordionItem>
                  {(trial.lead_org || trial.principal_investigator) &&
                    <AccordionItem titleCollapsed="Lead Organization">
                      {trial.lead_org && trial.lead_org !== '' &&
                      <p className="leadOrg">
                        <strong>Lead Organization</strong>
                        {trial.lead_org}
                      </p>
                      }
                      {trial.principal_investigator && trial.principal_investigator !== '' &&
                      <p className="investigator">
                        <strong>Principal Investigator</strong>
                        {trial.principal_investigator}
                      </p>
                      }
                    </AccordionItem>
                  }
                  <AccordionItem titleCollapsed="Trial IDs">
                    <ul className="trial-ids">
                      <li>
                        <strong>Primary ID</strong>
                        {trial.protocol_id}
                      </li>
                      <li>
                        <strong>Clinicaltials.gov ID</strong>
                        <a
                          href={`http://clinicaltrials.gov/show/${trial.nct_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {trial.nct_id}
                        </a>
                      </li>
                    </ul>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="trial-description-page__aside">
                {renderDelighters()}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default TrialDescriptionPage;
