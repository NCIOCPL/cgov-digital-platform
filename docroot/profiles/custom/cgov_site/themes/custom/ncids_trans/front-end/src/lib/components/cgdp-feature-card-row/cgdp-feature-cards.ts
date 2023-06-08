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
 * Gets text content of the exact link area.
 * @param {Event} evt - Click event
 */
const getLinkText = (evt: Event): string => {
	const link = evt.currentTarget as HTMLElement;
	const linkArea = getLinkArea(evt);

	const textOptions: { [key: string]: string } = {
		Image: 'Image',
		Description: getText(link, '.nci-card__description'),
		Title: getText(link, '.nci-card__title'),
	};

	return textOptions[linkArea] || 'Not Defined';
};

/**
 * Feature card on click handler.
 * @param {number} rowItems - Number of cards in row.
 * @param {number} rowItemIndex - Index of card selected in row.
 */
const featureCardLinkClickHandler =
	(rowItems: number, rowItemIndex: number | '_ERROR_') =>
	(evt: Event): void => {
		const link = evt.currentTarget as HTMLElement;

		landingClickTracker(
			link,
			'FeatureCard',
			rowItems,
			rowItemIndex,
			'Feature Card',
			'Light',
			'Standard Single Link',
			getText(link, '.nci-card__title'),
			link.dataset.eddlLandingItemLinkType || '_ERROR_',
			getLinkText(evt),
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
	const rowItemIndex = allCards.indexOf(card) + 1;
	const rowItems = allCards.length;

	card.addEventListener(
		'click',
		featureCardLinkClickHandler(rowItems, rowItemIndex)
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
