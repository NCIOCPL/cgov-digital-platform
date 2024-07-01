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

/** Constant to define the heading selectors. */
const HEADING_SELECTORS = 'h1, h2, h3, h4, h5, h6';

/**
 * Gets the text of the nearest heading for an element
 * @param {HTMLElement} el - The element to start searching from.
 */
const getNearestHeadingText = (el: HTMLElement | null): string => {
	// Note: el should never be null. A click event for these analytics will
	// not get attached to any link in a cgdp-landing-content-block, so that
	// will always exist. We check el here because of TS and it is a good thing.
	if (el === null || el.classList.contains('cgdp-landing-content-block')) {
		return 'Not Defined';
	}

	let curr = el.previousElementSibling;

	while (curr !== null) {
		if (curr.matches(HEADING_SELECTORS)) {
			const content = curr.textContent?.trim();
			return content && content !== null && content !== ''
				? content
				: 'Not Defined';
		}
		curr = curr.previousElementSibling;
	}
	return getNearestHeadingText(el.parentElement);
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
 * @param totalLinks the content block element.
 */
const contentBlockLinkClickHandler =
	(totalLinks: HTMLAnchorElement[]) => (evt: Event) => {
		const target = evt.currentTarget as HTMLAnchorElement;
		const { containerItems, containerItemIndex } = getContainerItemInfo(target);
		landingClickTracker(
			target,
			'ContentBlock', // linkName
			containerItems, // containerItems
			containerItemIndex, // containerItemsIndex
			'Content Block', // componentType
			'Not Defined', // componentTheme
			'Not Defined', // componentVariant
			getNearestHeadingText(target) as string, // title
			getLinkType(target as HTMLAnchorElement), // linkType
			!target.textContent ? '_ERROR_' : target.textContent.trim(), // linkText
			'Text', // linkArea
			totalLinks.length, // totalLinks
			totalLinks.indexOf(target) + 1 // linkPosition
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} contentBlock - The NCIDS Content Block Element.
 */
const contentBlockHelper = (contentBlock: HTMLElement): void => {
	const links = Array.from(
		contentBlock.querySelectorAll('a')
	) as HTMLAnchorElement[];
	links.forEach((link) => {
		link.addEventListener('click', contentBlockLinkClickHandler(links));
	});
};

/**
 * Wires up the content block for the cdgp requirements.
 */
const initialize = () => {
	const contentBlocks = document.querySelectorAll(
		'.cgdp-landing-content-block'
	) as NodeListOf<HTMLElement>;
	if (!contentBlocks.length) return;
	contentBlocks.forEach((contentBlockEl) => {
		const contentBlock = contentBlockEl as HTMLElement;
		contentBlockHelper(contentBlock);
	});
};

export default initialize;
