import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets text content by selector.
 * @param {HTMLElement} link - Selected card.
 * @param {string} selector - Selector for query.
 */
const getText = (link: HTMLElement, selector: string): string => {
	const element = link.querySelector(selector);
	const text = element?.textContent?.trim();

	return text || '_ERROR_';
};

/**
 * Gets the exact location clicked that triggered the event.
 * @param {Event} evt - Click event
 */
const getLinkArea = (evt: Event): string => {
	const link = evt.target as HTMLElement;
	const tag = link.tagName;

	const tags: { [key: string]: string } = {
		IMG: 'Image',
		P: 'Description',
		SPAN: 'Title',
	};

	return tags[tag] || 'Not Defined';
};

/**
 * Gets the title of the flag card group.
 * @param {HTMLElement} link - selected card.
 */
const getTitle = (link: HTMLElement): string => {
	const parentSection = link.closest('.usa-section');
	const title = parentSection?.querySelector('.nci-heading-h2')?.textContent;
	return title?.trim() || 'Not Defined';
};

/**
 * Feature card on click handler.
 * @param {number} containerItems - Number of cards in row.
 * @param {number} containerItemIndex - Index of card selected in row.
 */
const flagCardLinkClickHandler =
	(containerItems: number, containerItemIndex: number | '_ERROR_') =>
	(evt: Event): void => {
		evt.preventDefault();
		const link = evt.currentTarget as HTMLElement;

		landingClickTracker(
			link,
			'FlagCard',
			containerItems,
			containerItemIndex,
			'Flag Card',
			'Not Defined',
			'Not Defined',
			getTitle(link),
			link.dataset.eddlLandingItemLinkType || '_ERROR_',
			getText(link, '.cgdp-flag-card__title').trim(),
			getLinkArea(evt),
			1,
			1
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} card - The Feature Card element.
 */
const flagCardHelper = (card: HTMLElement): void => {
	const parentRowContainer = card.closest('[data-eddl-landing-row]');
	const allCards = parentRowContainer
		? Array.from(
				parentRowContainer.querySelectorAll('[data-eddl-landing-item]')
		  )
		: [];
	const containerItemIndex = allCards.indexOf(card) + 1;
	const containerItems = allCards.length;

	card.addEventListener(
		'click',
		flagCardLinkClickHandler(containerItems, containerItemIndex)
	);
};

/**
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	const flagCardEls = document.querySelectorAll(
		'[data-eddl-landing-item="flag_card"]'
	);
	if (!flagCardEls.length) return;

	flagCardEls.forEach((flagCardEl) => {
		const flagCard = flagCardEl as HTMLElement;
		flagCardHelper(flagCard);
	});
};

export default initialize;
