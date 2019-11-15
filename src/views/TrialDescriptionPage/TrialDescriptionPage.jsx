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
                  {trial.detailDescription}
                </AccordionItem>
                <AccordionItem titleCollapsed="Trial Phase &amp; Type">
                  <Table
                    borderless
                    columns={[
                      {
                        colId: 'phase',
                        displayName: 'Trial Phase',
                      },
                      {
                        colId: 'type',
                        displayName: 'Trial Type',
                      },
                    ]}
                    data={[
                      {
                        phase: `Phase ${trial.trialPhase.phaseNumber}`,
                        type: trial.primaryPurpose.code,
                      },
                    ]}
                  />
                </AccordionItem>
                {(trial.leadOrganizationName ||
                  trial.principalInvestigator) && (
                  <AccordionItem titleCollapsed="Lead Organization">
                    <>
                      {trial.leadOrganizationName &&
                        trial.leadOrganizationName !== '' && (
                          <p className="leadOrg">
                            <strong>Lead Organization</strong>
                            {trial.leadOrganizationName}
                          </p>
                        )}
                      {trial.principalInvestigator &&
                        trial.principalInvestigator !== '' && (
                          <p className="investigator">
                            <strong>Principal Investigator</strong>
                            {trial.principalInvestigator}
                          </p>
                        )}
                    </>
                  </AccordionItem>
                )}
                <AccordionItem titleCollapsed="Trial IDs">
                  <ul className="trial-ids">
                    <li>
                      <strong>Primary ID</strong>
                      {trial.protocolID}
                    </li>
                    <li>
                      <strong>Clinicaltials.gov ID</strong>
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
              {/* <div class="no-resize cts-share view-delighter-share">
			<div class="share-text">Share this clinical trial with your doctor:</div>
									<a class="print" title="Print" href="#">
				<span class="icon icon-print"></span><span class="text">Print</span>
			</a><a class="email" title="Email" href="/common/popUps/PopEmail.aspx?title=Radiation+Therapy+or+Radiation+Therapy+and+Temozolomide+in+Treating+Patients+with+Newly+Diagnosed+Anaplastic+Glioma+or+Low+Grade+Glioma&amp;docurl=%2fabout-cancer%2ftreatment%2fclinical-trials%2fsearch%2fv%3floc%3d0__amp%3btid%3dNCT00887146__amp%3brl%3d2__amp%3bid%3dNCI-2011-01915__amp%3bpn%3d1__amp%3bni%3d10&amp;language=en&amp;a=O688268744&amp;b=1j5801">
				<span class="icon icon-email"></span><span class="text">Email</span>
			</a>
		</div> */}
            </div>
          </div>
        </article>
      )}
    </>
  );
};

export default TrialDescriptionPage;
