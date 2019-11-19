import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { history } from '../../services/history.service';
import { getTrial } from '../../store/actions';
import {
  Accordion,
  AccordionItem,
  Delighter,
  TrialStatusIndicator,
  Table,
} from '../../components/atomic';
import SitesList from './SitesList';
import './TrialDescriptionPage.scss';
const queryString = require('query-string');

const TrialDescriptionPage = ({ location }) => {
  const dispatch = useDispatch();
  const [isTrialLoading, setIsTrialLoading] = useState(true);
  const qs = location.search;
  const parsed = queryString.parse(qs);
  const currId = parsed.id;

  const trial = useSelector(store => store.cache[currId]);

  useEffect(() => {
    if (trial) {
      initTrialData();
    }
  }, [trial]);

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if (trial && trial.briefTitle) {
      initTrialData();
    } else {
      dispatch(getTrial({ trialId: currId }));
    }
  }, []);

  const initTrialData = () => {
    setIsTrialLoading(false);
  };

  const handlePrintTrial = () => {
    window.print();
  };

  const handleEmailTrial = () => {
    window.location.href = `mailto:?subject=Information%20from%20the%20National%20Cancer%20Institute%20Web%20Site&body=I%20found%20this%20information%20on%20www.cancer.gov%20and%20I'd%20like%20to%20share%20it%20with%20you:%20https%3A%2F%2Fwww.cancer.gov%2Fabout-cancer%2Ftreatment%2Fclinical-trials%2Fsearch%2Fv%3Fid%3D${currId}%0A%0A%20NCI's%20Web%20site,%20www.cancer.gov,%20provides%20accurate,%20up-to-date,%20comprehensive%20cancer%20information%20from%20the%20U.S.%20government's%20principal%20agency%20for%20cancer%20research.%20If%20you%20have%20questions%20or%20need%20additional%20information,%20we%20invite%20you%20to%20contact%20NCI%E2%80%99s%20LiveHelp%20instant%20messaging%20service%20at%20https://livehelp.cancer.gov,%20or%20call%20the%20NCI's%20Contact%20Center%201-800-4-CANCER%20(1-800-422-6237)%20(toll-free%20from%20the%20United%20States).`;
  };

  const renderDelighters = () => {
    return (
      <>
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
              Use the checklist in our guide to gather the information you’ll
              need.
            </p>
          </Delighter>
        </div>
        <div className="delighter cts-share">
          <div className="share-text">
            Share this clinical trial with your doctor:
          </div>
          <div className="share-btn-container">
            <button
              className="share-btn cts-share-print"
              type="button"
              onClick={handlePrintTrial}
            >
              <span className="icon icon-print" aria-hidden="true"></span>
              Print
              <span className="show-for-sr"> this trial</span>
            </button>
            <button
              className="share-btn cts-share-email"
              type="button"
              onClick={handleEmailTrial}
            >
              <span className="icon icon-email" aria-hidden="true"></span>
              Email <span className="show-for-sr">this trial</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderTrialDescriptionHeader = () => {
    return (
      <div className="trial-description-page__header">
        <h1>{trial.briefTitle}</h1>
        <div className="back-to-search btnAsLink">
          <span onClick={() => history.goBack()}>
            &lt; Back to search results
          </span>
        </div>
        <div>
          This clinical trial matches: "all trials" |{' '}
          <button className="btnAsLink">Start Over</button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isTrialLoading ? (
        <div>Loading</div>
      ) : (
        <article className="trial-description-page">
          {renderTrialDescriptionHeader()}

          <div className="trial-description-page__description">
            <div className="trial-description-page__content">
              <TrialStatusIndicator
                status={trial.currentTrialStatus.toLowerCase()}
              />
              <Accordion>
                <AccordionItem titleCollapsed="Description" expanded>
                  {trial.briefSummary}
                </AccordionItem>
                <AccordionItem titleCollapsed="Eligibility Criteria">
                  <div>
                    {trial.eligibilityInfo.unstructuredCriteria.map(
                      (item, idx) => (
                        <p key={`uc-${idx}`}>{item.description}</p>
                      )
                    )}
                  </div>
                </AccordionItem>
                <AccordionItem titleCollapsed="Locations &amp; Contacts">
                  <SitesList sites={trial.sites} />
                </AccordionItem>
                <AccordionItem titleCollapsed="Trial Objectives and Outline">
                  {trial.detailedDescription}
                </AccordionItem>
                <AccordionItem titleCollapsed="Trial Phase &amp; Type">
                  <>
                      {trial.trialPhase.phaseNumber &&
                        trial.trialPhase.phaseNumber !== '' && (
                          <p className="trial-phase">
                            <strong class="field-label">Trial Phase</strong>
                            {`Phase ${trial.trialPhase.phaseNumber}`}
                          </p>
                        )}
                      {trial.primaryPurpose.code &&
                        trial.primaryPurpose.code !== '' && (
                          <p className="trial-type">
                            <strong  class="field-label">Trial Type</strong>
                            {trial.primaryPurpose.code}
                          </p>
                        )}
                    </>

                </AccordionItem>
                {(trial.leadOrganizationName ||
                  trial.principalInvestigator) && (
                  <AccordionItem titleCollapsed="Lead Organization">
                    <>
                      {trial.leadOrganizationName &&
                        trial.leadOrganizationName !== '' && (
                          <p className="leadOrg">
                            <strong class="field-label">Lead Organization</strong>
                            {trial.leadOrganizationName}
                          </p>
                        )}
                      {trial.principalInvestigator &&
                        trial.principalInvestigator !== '' && (
                          <p className="investigator">
                            <strong  class="field-label">Principal Investigator</strong>
                            {trial.principalInvestigator}
                          </p>
                        )}
                    </>
                  </AccordionItem>
                )}
                <AccordionItem titleCollapsed="Trial IDs">
                  <ul className="trial-ids">
                    <li>
                      <strong class="field-label">Primary ID</strong>
                      {trial.protocolID}
                    </li>
                    <li>
                      <strong class="field-label">Clinicaltials.gov ID</strong>
                      <a
                        href={`http://clinicaltrials.gov/show/${trial.nctID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {trial.nctID}
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
    </>
  );
};

export default TrialDescriptionPage;
