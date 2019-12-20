import { NCIAnalytics } from 'Core/libraries/analytics/nci-analytics-functions';

/**
 * The types of events that can be dispatched
 */
export const EVENT_TYPES = {
  Link: 'LINK',
  Load: 'LOAD'
}

/**
 * Initializes the dumb data layer.
 *
 * Note: AppMeasurementCustom will expose this function to Adobe, so we cannot
 * reference the module from here. But that is all cool since this is Javascript
 * and as long as the object looks like AppMeasurementCustom all will be good.
 *
 * @param {Object} s - An instance of an Adobe Analytics s object.
 * @param {Object} AppMeasurementCustom - An/The instance of AppMeasurementCustom
 */
export const initializeDumbDataLayer = (s, AppMeasurementCustom) => {

  // Define the analytics function that will handle the pushing
  const analyticsDispatcher = (type, data) => {
    if (type !== EVENT_TYPES.Load && type !== EVENT_TYPES.Link) {
      throw new Error('Unknown tracking type')
    }

    internalAnalyticsDispatcher(
      type, data, s, AppMeasurementCustom
    );
  }

  // Redefine the push method to do what we want.
	const pusher = (...args) => {
    for(const {type, data} of args) {
      analyticsDispatcher(type, data);
    }
  };

  // ----- Logic below -----

  // Make sure the data layer exists
  window.dumbDataLayer = window.dumbDataLayer || [];

  // Set our pusher if it is not already set
  // this should avoid accidental re-initializations
  if (window.dumbDataLayer.push !== pusher) {
    // Process all the existing items until the queue is
    // empty.
    let existingItem;
    while ((existingItem = window.dumbDataLayer.shift()) !== undefined) {
      analyticsDispatcher(existingItem.type, existingItem.data);
    }
    window.dumbDataLayer.push = pusher;
  }
}

/**
 * Internal method to handle dispatching analytics calls.
 *
 * @param {string} type - the type of event (LINK or LOAD)
 * @param {Object} data - the data for the event
 * @param {Object} s - A reference to an Adobe Analytics s object
 * @param {Object} AppMeasurementCustom - a reference to the AppMeasurementCustom instance
 */
const internalAnalyticsDispatcher = (type, data, s, AppMeasurementCustom) => {

  if (type === EVENT_TYPES.Load) {
    trackLoad(data, s, AppMeasurementCustom);
  } else {
    trackLink(data, s, AppMeasurementCustom);
  }
};

/**
 * Tracks a page load event.
 *
 * @param {Object} data - the data for the event
 * @param {Object} s - A reference to the analytics resolver
 * @param {Object} AppMeasurementCustom - a reference to the AppMeasurementCustom instance
 */
const trackLoad = (data, s, AppMeasurementCustom) => {

  const {
    pageName = null,
    events = [],
    eVars = {},
    props = {}
  } = data;

  s.clearVars();
  AppMeasurementCustom.setScodeProperties(s);

  // Overwrite the page name
  // TODO: find out why this does not work, or remove it.
  s.pageName = (pageName && pageName !== '') ? pageName : s.pageName;

  // Overwrite or add new evars.
  for (const [id, evar] of Object.entries(eVars)) {
    s[`eVar${id}`] = evar;
  }

  // Overwrite or add new props.
  for (const [id, prop] of Object.entries(props)) {
    s[`prop${id}`] = prop;
  }

  // Events are a PITA as they will be an array of strings,
  // with possibly additional data like event47=12. So let's
  // assume we are not overwriting events, but just adding.
  const ourEventsStr = events.length > 0 ?
    events.map(evt => 'event' + evt).join(',') :
    '';
  if (ourEventsStr) {
    s.events = (s.events && s.events.length > 0) ?
      s.events + ',' + ourEventsStr :
      ourEventsStr
  }

  s.t();
}

/**
 * Tracks a link event.
 *
 * @param {Object} data - the data for the event
 * @param {Object} s - A reference to the Adobe Analytics s object
 * @param {Object} AppMeasurementCustom - a reference to the AppMeasurementCustom instance
 */
const trackLink = ({
  linkname = 'dataLayerLink',
  pagename = null,
  events = [],
  eVars = {},
  props = {}
} = {}, s, AppMeasurementCustom) => {
  // There is too much logic in ClickParams to rewrite it,
  // so might as well use it.
  var clickParams = new NCIAnalytics.ClickParams(
    true, // This is set to true in many places
    s_account, // This param is not actually used, so let's set it to what is used.
    'o',
    linkname
  );

  clickParams.Props = props;
  clickParams.Evars = eVars;
  clickParams.Events = events; // Array passes through here
  clickParams.LogToOmniture();
}

/**
 * Queues up an Adobe Analytics call -- the push method
 * is actually defined in DTM.
 * @param {string} type - the type of event LOAD or LINK
 * @param {Object} data - the data for the call.
 */
export const dispatchTrackingEvent = (type, data) => {
  if (type !== EVENT_TYPES.Load && type !== EVENT_TYPES.Link) {
    throw new Error('Unknown tracking type')
  }

  (window.dumbDataLayer = window.dumbDataLayer || []).push({
    type: type,
    data: data,
  });

}
