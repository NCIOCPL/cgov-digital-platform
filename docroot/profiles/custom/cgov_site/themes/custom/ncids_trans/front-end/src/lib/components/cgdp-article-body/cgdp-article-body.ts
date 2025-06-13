import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';
import {
	accordionizeForMobile,
	accordionAnalyticsHandler,
} from '../../core/util/accordionize-for-mobile';

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
