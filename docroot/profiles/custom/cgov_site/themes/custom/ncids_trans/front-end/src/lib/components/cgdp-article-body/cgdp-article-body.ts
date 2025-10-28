import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';
import {
	accordionizeForMobile,
	accordionAnalyticsHandler,
} from '../../core/util/accordionize-for-mobile';

import { bodyLinkAnalyticsHelper } from '../../core/analytics/inner-page-analytics-tracker';

// Track if wysiwygBodyLinkTrackin has been initialize before
let articleBodyLinkTrackingHasInit = false;

// Track the accordion instance so we do not repeatedly create/destroy it.
let accordionInstance: USAAccordion | null = null;

// Track if the Accordion has been opened before
// (Analytics requests that the first interaction with
// the accordion be tracked)
let accordionHasOpened = false;

/**
 * We create a local click handler to also track the status of the accordion
 * via the accordionHasOpened variable (which is local to each component)
 * @param accordionButtons Accordion buttons to pass to analytics
 * @returns
 */
export const accordionClickHandler =
	(accordionButtons: HTMLElement[]) => (evt: Event) => {
		accordionAnalyticsHandler(
			accordionButtons,
			accordionHasOpened,
			'Body Accordion',
			evt
		);
		accordionHasOpened = true;
	};

/**
 * Initialize USA Accordion
 */
const initialize = (): void => {
	/**
	 * WYSIWYG Body Link Analytics
	 */
	if (articleBodyLinkTrackingHasInit == false) {
		const articleBodySections = document.querySelectorAll(
			'.cgdp-article-body__section'
		) as NodeListOf<HTMLElement>;
		if (articleBodySections) {
			articleBodySections.forEach((sections, index) => {
				const articleBody = sections as HTMLElement;
				bodyLinkAnalyticsHelper(articleBody, index);
			});
			articleBodyLinkTrackingHasInit = true;
		}
	}

	accordionInstance = accordionizeForMobile(
		'.cgdp-article-body--multiple',
		accordionInstance
	) as USAAccordion | null; // Because the function can return undefined, we cast it to USAAccordion | null
	accordionHasOpened = false;

	// Accordion Analytics (For Mobile)
	const accordion = document.querySelector(
		'.cgdp-article-body.usa-accordion'
	) as HTMLElement;
	if (!accordion) return;
	const accordionButtons = Array.from(accordion.querySelectorAll('button'));
	accordionButtons.forEach((button) => {
		button.addEventListener('click', accordionClickHandler(accordionButtons));
	});
};

export default initialize;
