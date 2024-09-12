import {
	getContainerItemInfo,
	landingClickTracker,
} from '../../core/analytics/landing-page-contents-helper';

/**
 * Enum for the type of link.
 */
enum LinkTypes {
	/** For external links */
	External = 'External',
	/** For mailto links */
	Email = 'Email',
	/** For internal links (managed and unmanaged) */
	Internal = 'Internal',
	/** For managed media links */
	Media = 'Media',
	/** For any other link with a protocol */
	Other = 'Other',
}

/**
 * Gets the text of the nearest heading for an element
 * @param {HTMLElement} summaryBox - The element to start searching from.
 */
const getTitle = (summaryBox: HTMLElement): string => {
	const element = summaryBox.querySelector('.usa-summary-box__heading');
	const text = element?.textContent?.trim();

	return text || 'Not Defined';
};

/**
 * Gets the analytics type for a link.
 * @param link the link that was clicked.
 * @returns the type
 */
const getLinkType = (link: HTMLAnchorElement): LinkTypes => {
	switch (link.protocol) {
		case 'http:':
		case 'https:': {
			if (link.hostname === window.location.hostname) {
				if (link.dataset.entityType === 'media') {
					return LinkTypes.Media;
				} else {
					return LinkTypes.Internal;
				}
			} else {
				return LinkTypes.External;
			}
		}
		case 'mailto:':
			return LinkTypes.Email;
		default:
			return LinkTypes.Other;
	}
};

/**
 * Click handler for the language toggle click.
 * @param totalLinks the summary box element.
 */
const summaryBoxLinkClickHandler =
	(totalLinks: HTMLAnchorElement[], summaryBox: HTMLElement) =>
	(evt: Event) => {
		const target = evt.currentTarget as HTMLAnchorElement;
		const { containerItems, containerItemIndex } = getContainerItemInfo(target);
		landingClickTracker(
			target,
			'SummaryBox', // linkName
			containerItems, // containerItems
			containerItemIndex, // containerItemsIndex
			'Summary Box', // componentType
			'Not Defined', // componentTheme
			'Not Defined', // componentVariant
			getTitle(summaryBox), // title
			getLinkType(target as HTMLAnchorElement), // linkType
			!target.textContent ? '_ERROR_' : target.textContent.trim(), // linkText
			'Text', // linkArea
			totalLinks.length, // totalLinks
			totalLinks.indexOf(target) + 1 // linkPosition
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} summaryBox - The NCIDS Content Block Element.
 */
const summaryBoxHelper = (summaryBox: HTMLElement): void => {
	const links = Array.from(
		summaryBox.querySelectorAll('a')
	) as HTMLAnchorElement[];
	links.forEach((link) => {
		link.addEventListener(
			'click',
			summaryBoxLinkClickHandler(links, summaryBox)
		);
	});
};

/**
 * Wires up the summary box for the cdgp requirements.
 */
const initialize = () => {
	const summaryBoxs = document.querySelectorAll(
		'.cgdp-summary-box'
	) as NodeListOf<HTMLElement>;
	if (!summaryBoxs.length) return;
	summaryBoxs.forEach((summaryBoxEl) => {
		const summaryBox = summaryBoxEl as HTMLElement;
		summaryBoxHelper(summaryBox);
	});
};

export default initialize;
