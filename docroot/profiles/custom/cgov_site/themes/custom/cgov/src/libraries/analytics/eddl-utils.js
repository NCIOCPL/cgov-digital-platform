/*-------------------------------------------------------------------
 * For more information on what gets logged to the Event-driven Data
 * Layer (EDDL) go to the following URL:
 * https://github.com/NCIOCPL/launch-extension-eddl/wiki/EDDL-Design
 *
 * NOTE: This is just stolen from the ncids-trans theme and with
 * the TypeScript removed. This is annoying, but I am not adding
 * TypeScript into the cgov_common legacy theme build.)
 *-----------------------------------------------------------------*/

/**
 * Defines the possible Event-driven Data Layer (EDDL) Event Types.
 */
const EDDLEventTypes = {
  PageLoad: 'PageLoad',
  Other: 'Other',
};

const track = (eventData) => {
	window.NCIDataLayer = window.NCIDataLayer || [];
	window.NCIDataLayer.push(eventData);
};

// NOTE: We do not have page load as this util will never be used for that.

/**
 * This method tracks an Other event.
 *
 * @param eventName The name of the event. This is used in Launch.
 * @param linkName The name for the link. This is used to debug.
 * @param data The data for the event.
 */
export const trackOther = (
	eventName,
	linkName,
	data
) => {
	track({
		type: EDDLEventTypes.Other,
		event: eventName,
		linkName,
		data,
	});
};
