/**
 * This file represents the legacy ClickParams and LogToOmniture where we will send to EDDL.
 */

import { trackOther } from './eddl-utils';

/**
 * @typedef {Object} LegacyAnalyticsData The analytics object
 * @property {Object} [Props] The properties key/value collection
 * @property {Object} [Evars] The event properties key/value collection
 * @property {Array[number]} [Events] An array of events
 */

/**
 * Fire an EDDL Other call for our legacy function
 * @param {string} linkName The linkname for the analytics
 * @param {string} legacyFunction The name of the calling function.
 * @param {LegacyAnalyticsData} legacyData the data with the props/evars/events for the EDDL call.
 */
export const legacyTrackOther = (
  linkName,
  legacyFunction,
  legacyData
) => {
  trackOther(
    'LegacyAnalytics:Other',
    linkName,
    {
      legacyFunction,
      // This is reshaping legacyData to match existing code for legacyDDL that we are going
      // to copy/paste in launch.
      rawData: {
        props: legacyData.Props ? legacyData.Props : {},
        eVars: legacyData.Evars ? legacyData.Evars : {},
        events: legacyData.Events ? legacyData.Events : [],
      }
    },
  );
};
