/**
 * The types of events that can be dispatched
 */
export const EVENT_TYPES = {
  Link: 'LINK',
  Load: 'LOAD'
}

/**
 * Queues up an Adobe Analytics call -- the push method
 * is actually defined in Launch.
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
