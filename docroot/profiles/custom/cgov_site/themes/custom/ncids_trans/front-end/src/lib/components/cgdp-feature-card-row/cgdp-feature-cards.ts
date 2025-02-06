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
 * Gets text content by selector.
 * @param {HTMLElement} link - Selected card.
 * @param {string} selector - Selector for query.
 */
const getTitle = (link: HTMLElement, selector: string): string => {
	const container = link.closest('.usa-section') as HTMLElement;
	const element = container?.querySelector(selector);
	const text = element?.textContent?.trim();

	return text || 'Not Defined';
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
 * Feature card on click handler.
 * @param {number} containerItems - Number of cards in row.
 * @param {number} containerItemIndex - Index of card selected in row.
 */
const featureCardLinkClickHandler =
	(containerItems: number, containerItemIndex: number | '_ERROR_') =>
	(evt: Event): void => {
		const link = evt.currentTarget as HTMLElement;

		landingClickTracker(
			link,
			'FeatureCard',
			containerItems,
			containerItemIndex,
			'Feature Card',
			'Light',
			'Standard Single Link',
			getTitle(link, '.cgdp-feature-card-row__heading'), // title of row
			link.dataset.eddlLandingItemLinkType || '_ERROR_',
			getText(link, '.nci-card__title'), // title of card
			getLinkArea(evt),
			1,
			1
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} card - The Feature Card element.
 */
const featureCardHelper = (card: HTMLElement): void => {
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
		featureCardLinkClickHandler(containerItems, containerItemIndex)
	);
};

/**
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	const featureCardEls = document.querySelectorAll(
		'[data-eddl-landing-item="feature_card"]'
	);
	if (!featureCardEls.length) return;

	featureCardEls.forEach((featureCardEl) => {
		const featureCard = featureCardEl as HTMLElement;
		featureCardHelper(featureCard);
	});
};

export default initialize;
