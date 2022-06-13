/*-------------------------------------------------------------------
 * For more information on what gets logged to the Event-driven Data
 * Layer (EDDL) go to the following URL:
 * https://github.com/NCIOCPL/launch-extension-eddl/wiki/EDDL-Design
 *-----------------------------------------------------------------*/

/**
 * Defines the possible Event-driven Data Layer (EDDL) Event Types.
 */
enum EDDLEventTypes {
	/** PageLoad is used for a page load event (i.e. s.t) */
	PageLoad = 'PageLoad',
	/** Other is used for a click-type events event (i.e. s.tl) */
	Other = 'Other',
}

/**
 * The common properties for an EDDL event data.
 */
type EDDLEventData = {
	/** The Event Type */
	type: EDDLEventTypes;
};

/**
 * The properties of an Other event.
 */
type EDDLOtherEventData = EDDLEventData & {
	/** The name of the event as used in Launch */
	event: string;
	/** The name of the link as used in debugging */
	linkName: string;
	/** The data for the event.  */
	data: object;
};

/**
 * This defines the page load data.
 *
 * NOTE: This is not used right now as Launch handles the page load events.
 * However, this *IS* the shape of the PageLoad Event.
 */
type EDDLPageLoadPageData = {
	/** This is the analytics page name */
	name: string;
	/** The title of the page */
	title: string;
	/** The contents of the <title> tag */
	metaTitle: string;
	/** The language of the page. `english` or `spanish` should be used. */
	language: string;
	/** The CMS type of the page */
	type: string;
	/** The audience of the page. Currently either `Patient` or `Health Professional` */
	audience: string;
	/** The channel of the page, this is tied to the site section */
	channel: string;
	/** The content grouping for the page. This is a thematic, and cuts accross channels and types. e.g., CancerCurrents */
	contentGroup: string;
	/** The date the page was "published". This is usually the posted date field, which is what we display on the site. */
	publishedData: Date;
	/** This is an object that contains additional data points. I */
	additionalDetails: object;
};

/**
 * The properties of an Other event.
 */
type EDDLPageLoadEventData = EDDLEventData & {
	/** The name of the event as used in Launch */
	event: string;
	/** The page information for the load event. */
	page: EDDLPageLoadPageData;
};

//Defines the EDDL Object on the window
declare global {
	interface Window {
		/** Defines the EDDL data layer queue on the window. */
		NCIDataLayer: {
			/**
			 * Pushes an event on the EDDL queue
			 * @param eventData The data for the event.
			 */
			push(eventData: EDDLEventData): void;
		};
	}
}

const track = (eventData: EDDLPageLoadEventData | EDDLOtherEventData) => {
	window.NCIDataLayer = window.NCIDataLayer || [];
	window.NCIDataLayer.push(eventData);
};

/**
 * This method tracks an Other event.
 *
 * @param eventName The name of the event. This is used in Launch.
 * @param linkName The name for the link. This is used to debug.
 * @param data The data for the event.
 */
export const trackOther = (
	eventName: string,
	linkName: string,
	data: object
) => {
	track({
		type: EDDLEventTypes.Other,
		event: eventName,
		linkName,
		data,
	});
};
