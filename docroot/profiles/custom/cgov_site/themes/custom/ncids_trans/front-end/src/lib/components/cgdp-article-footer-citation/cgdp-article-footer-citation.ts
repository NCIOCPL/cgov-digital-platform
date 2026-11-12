import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';
import {
	accordionizeForMobile,
	accordionAnalyticsHandler,
} from '../../core/util/accordionize-for-mobile';
import { trackOther } from '../../core/analytics/eddl-util';

const PRESS_RELEASE_REFERENCE_EVENT_NAME = 'PressRelease:Reference:LinkClick';
const REFERENCE_LINK_SELECTOR = '.cgdp-article-footer-citation a';

const referenceLinkClickHandler = (evt: Event): void => {
	const link = evt.currentTarget as HTMLAnchorElement;

	trackOther(
		PRESS_RELEASE_REFERENCE_EVENT_NAME,
		PRESS_RELEASE_REFERENCE_EVENT_NAME,
		{
			location: 'Body',
			componentType: 'Reference',
			linkText: link.textContent?.trim() || '_ERROR_',
		}
	);
};

const initializeReferenceLinkAnalytics = (): void => {
	const referenceLinks = Array.from(
		document.querySelectorAll(REFERENCE_LINK_SELECTOR)
	) as HTMLAnchorElement[];

	referenceLinks.forEach((link) => {
		if (link.dataset.pressReleaseReferenceAnalyticsInit === 'true') {
			return;
		}

		link.dataset.pressReleaseReferenceAnalyticsInit = 'true';
		link.addEventListener('click', referenceLinkClickHandler);
	});
};

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
			'Citation Accordion',
			evt
		);
		accordionHasOpened = true;
	};

/**
 * Wires up the selected resources element
 * as an accordion when on mobile
 * @param trackPressReleaseReferences Whether to track press release reference links.
 */
const initialize = (trackPressReleaseReferences = false) => {
	if (trackPressReleaseReferences) {
		initializeReferenceLinkAnalytics();
	}

	// Initialize the Accordion
	accordionInstance = accordionizeForMobile(
		'.cgdp-article-footer-citation',
		accordionInstance,
		'.nci-heading-h2'
	) as USAAccordion | null; // Because the function can return undefined, we cast it to USAAccordion | null
	accordionHasOpened = false;

	// Accordion Analytics (For Mobile)
	const accordion = document.querySelector(
		'.cgdp-article-footer-citation.usa-accordion'
	) as HTMLElement;
	if (!accordion) return;
	const accordionButtons = Array.from(accordion.querySelectorAll('button'));
	accordionButtons.forEach((button) => {
		button.addEventListener('click', accordionClickHandler(accordionButtons));
	});
};

export default initialize;
