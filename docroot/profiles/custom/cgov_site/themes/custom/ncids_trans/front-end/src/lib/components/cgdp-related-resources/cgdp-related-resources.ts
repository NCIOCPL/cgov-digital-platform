import { trackOther } from '../../core/analytics/eddl-util';
import { getPageInfo } from '../../core/analytics/landing-page-contents-helper';

import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';
import {
	accordionizeForMobile,
	accordionAnalyticsHandler,
} from '../../core/util/accordionize-for-mobile';

/**
 * Enum for the type of link.
 */
enum LinkTypes {
	/** For external links */
	External = 'External',
	/** For internal links (managed and unmanaged) */
	Internal = 'Internal',
	/** For managed media links */
	Media = 'Media',
}

// Track the accordion instance so we do not repeatedly create/destroy it.
let accordionInstance: USAAccordion | null = null;

// Track if the Accordion has been opened before
// (Analytics requests that the first interaction with
// the accordion be tracked)
let accordionHasOpened = false;

/**
 * Gets the text of the nearest heading for an element
 * @param relatedResourcesEl - The element to start searching from.
 */
const getHeadingText = (relatedResourcesEl: HTMLElement): string => {
	const element = relatedResourcesEl.querySelector('.nci-heading-h2');
	const text = element?.textContent?.trim();

	return text || 'Not Defined';
};

/**
 * Gets the analytics link type.
 * @param link The anchor to get the type for.
 * @returns The type for analytics reporting.
 */
const getLinkType = (link: HTMLAnchorElement): string => {
	const type = link.dataset.listItemType;

	switch (type) {
		case 'cgov_media_link':
			return LinkTypes.Media;
		case 'cgov_internal_link':
			return LinkTypes.Internal;
		case 'cgov_external_link':
			return LinkTypes.External;
		default:
			return '_ERROR_';
	}
};

/**
 * Click handler for the related resources link click.
 * @param relatedResourcesEl the related resources element.
 */
const relatedResourceLinkClickHandler =
	(
		headingText: string,
		totalLinks: number,
		linkPosition: number,
		pageType?: string,
		pageTemplate?: string
	) =>
	(evt: Event) => {
		const targetLink = evt.currentTarget as HTMLAnchorElement;

		const linkText = !targetLink.textContent
			? '_ERROR_'
			: targetLink.textContent.trim();

		trackOther(
			'Inner:RelatedResources:LinkClick',
			'Inner:RelatedResources:LinkClick',
			{
				location: 'Body',
				pageType,
				pageTemplate,
				componentType: 'Related Resources',
				title: headingText.slice(0, 50),
				linkType: getLinkType(targetLink),
				linkText: linkText.slice(0, 50),
				totalLinks: totalLinks,
				linkPosition: linkPosition,
			}
		);
	};

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
			'Related Resources Accordion',
			evt
		);
		accordionHasOpened = true;
	};

const relatedResourcesCreate = (relatedResourcesEl: HTMLElement) => {
	// Get page type
	const pageInfo = getPageInfo();

	const links = Array.from(
		relatedResourcesEl.querySelectorAll('a')
	) as HTMLAnchorElement[];

	links.forEach((link, index) => {
		link.addEventListener(
			'click',
			relatedResourceLinkClickHandler(
				getHeadingText(relatedResourcesEl),
				links.length,
				index + 1,
				pageInfo.pageType,
				pageInfo.pageTemplate
			)
		);
	});

	// Initialize the Accordion
	accordionInstance = accordionizeForMobile(
		'.cgdp-related-resources',
		accordionInstance
	) as USAAccordion | null; // Because the function can return undefined, we cast it to USAAccordion | null
	accordionHasOpened = false;

	// Accordion Analytics (For Mobile)
	const accordion = document.querySelector(
		'.cgdp-related-resources.usa-accordion'
	) as HTMLElement;
	if (!accordion) return;
	const accordionButtons = Array.from(accordion.querySelectorAll('button'));
	accordionButtons.forEach((button) => {
		button.addEventListener('click', accordionClickHandler(accordionButtons));
	});
};

/**
 * Wires up the related resources element for analytics
 * as well as the accordion when on mobile
 */
const initialize = () => {
	// Related resources are included in the templates, if we wanted a
	// similar list, we could reuse this component for that. However,
	// that would be a template change, and at that point this function
	// could be updated. So just handling 1 for now.

	const relatedResourcesEl = document.querySelector(
		'.cgdp-related-resources'
	) as HTMLElement;

	if (relatedResourcesEl === null) return;

	relatedResourcesCreate(relatedResourcesEl);
};

export default initialize;
