import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets the text of the nearest heading for an element
 * @param {HTMLElement} card - The element to start searching from.
 */
const getTitle = (card: HTMLElement): string => {
	const element = card.querySelector('.nci-guide-card__title');
	const text = element?.textContent?.trim();

	return text || 'Not Defined';
};

/**
 * Wide Guide Card onclick handler.
 * @param {HTMLElement[]} totalLinks - All links found in card.
 * @param {HTMLElement} card - Wide Guide Card of selected link.
 */
const wideGuideCardLinkClickHandler =
	(totalLinks: HTMLElement[], card: HTMLElement) =>
	(evt: Event): void => {
		const link = evt.currentTarget as HTMLAnchorElement;

		landingClickTracker(
			link,
			'WideGuideCard', // linkName
			1, // containerItems
			1, // containerItemsIndex
			'Wide Guide Card', // componentType
			'Not Defined', // componentTheme
			'Not Defined', // componentVariant
			getTitle(card), // title
			link.dataset.eddlLandingItemLinkType || '_ERROR_', // linkType
			!link.textContent ? '_ERROR_' : link.textContent.trim(), // linkText
			'Button', // linkArea
			totalLinks.length, // totalLinks
			totalLinks.indexOf(link) + 1 // linkPosition
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} card - The Guide Card element.
 */
const wideGuideCardHelper = (card: HTMLElement): void => {
	const links = Array.from(card.querySelectorAll('a'));
	links.forEach((link) => {
		link.addEventListener('click', wideGuideCardLinkClickHandler(links, card));
	});
};

/**
 * Wire up component per cgdp requirments.
 */
const initialize = (): void => {
	const guideCardEls = document.querySelectorAll('.nci-guide-card--cgdp-wide');
	if (!guideCardEls.length) return;

	guideCardEls.forEach((guideCardEl) => {
		const guideCard = guideCardEl as HTMLElement;
		wideGuideCardHelper(guideCard);
	});
};

export default initialize;
