import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { updateForm, getTrial } from '../../store/actions';
import {
  Delighter,
  Checkbox,
  Modal,
  Pager,
  ResultsList,
} from '../../components/atomic';

import './ProtocolPage.scss';

const ProtocolPage = ({ results }) => {
  const dispatch = useDispatch();

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

 useEffect(() => {
   console.log('run getTrial');
    dispatch(getTrial({ trialId: 'NCI-2018-03587' }));
 }, [dispatch])

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

 

  return (
    <div id="main-content" className="general-page-body-container main-content">
      <div className="contentzone">
        {/* */}
        <article className="protocol-page">
          <div className="protocol-page__content">
            Hi
           </div>
          <aside className="protocol-page__aside --bottom">
            {renderDelighters()}
          </aside>
        </article>
        {/* */}
      </div>
    </div>
  );
};


export default ProtocolPage;
