import { NCIAnalytics } from 'Core/libraries/analytics/nci-analytics-functions';
import { AppMeasurementCustom } from 'Core/libraries/analytics/AppMeasurement.custom';
import { dispatchTrackingEvent, EVENT_TYPES } from 'Core/libraries/analytics/dumb-datalayer';
import {AnalyticsActions} from '@nciocpl/clinical-trials-search-app';

/**
 * A clinical trials search application event
 * @typedef {Object} CTSEvent
 * @property {string} action - The type of action. Should be 'click' or 'pageload'.
 * @property {string} source - the name for the source of the event. (Required for 'click' actions)
 * @property {string} pagename - the name of the page/url. (we deal in URLs usually)
 * @property {Object} data - the payload of the event.
 */


/*******************
 * Core methods here.
 *******************/

/**
 * Function to track clinical trials search event.
 *
 * @param {CTSEvent} event - the event object
 */
export const trackCTSEvent = (event) => {

  switch(event.action) {
    case 'click':
      trackLink(event);
      break;
    case 'pageLoad':
      trackPageLoad(event);
      break;
    default:
      throw new Error(`Unknown event action ${event.action}`);
  }

}

/**
 * Function for handling click/link events
 * @param {CTSEvent} event - the event object
 */
const trackLink = (event) => {
  const linkFn = `link_${event.source}`;

  if (AnalyticsActions[linkFn]) {
    const actionsArr = AnalyticsActions[linkFn](event.data ? event.data : {});
    for (const {type, data} of actionsArr) {
      dispatchTrackingEvent(type, data);
    }
  } else {
    console.warn(`Link: ${event.source} has no handler.`)
  }
}

/**
 * Function for handling page load events
 * @param {CTSEvent} event - the event object
 */
const trackPageLoad = (event) => {
  const loadFn = `load_${event.page}`;

  if (AnalyticsActions[loadFn]) {
    const actionsArr = AnalyticsActions[loadFn](event.data ? event.data : {});
    for (const {type, data} of actionsArr) {
      dispatchTrackingEvent(type, data);
    }
  } else {
    console.warn(`Page Load: ${event.page} has no handler.`)
  }
}
