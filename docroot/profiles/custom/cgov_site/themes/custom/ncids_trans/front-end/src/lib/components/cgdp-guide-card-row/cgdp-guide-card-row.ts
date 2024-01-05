import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets card title.
 *
 * Title should be header if available. Otherwise, use description. Value is
 * truncated to 50 in landingClickTracker.
 *
 * @param {HTMLElement} card - Card element of selected link.
 * @returns {string} - Card title.
 */
const getTitle = (card: HTMLElement): string => {
	const ul = card.querySelector('ul');
	const id = ul?.getAttribute('aria-labelledby');
	const header = id ? document.getElementById(id)?.textContent?.trim() : null;
	const description = card.querySelector(
		'.nci-guide-card__description'
	)?.textContent;

	return header || description || '_ERROR_';
};

/**
 * Guide Card onclick handler.
 * @param {number} containerItems - Number of cards in row.
 * @param {number} containerItemIndex - Index of card clicked in row.
 * @param {HTMLElement[]} totalLinks - All links found in card.
 * @param {HTMLElement} card - Guide Card of selected link.
 */
const guideCardLinkClickHandler =
	(
		containerItems: number,
		containerItemIndex: number | '_ERROR_',
		totalLinks: HTMLElement[],
		card: HTMLElement,
		componentVariant: string
	) =>
	(evt: Event): void => {
		const link = evt.currentTarget as HTMLAnchorElement;

		landingClickTracker(
			link,
			'GuideCard',
			containerItems,
			containerItemIndex,
			'Guide Card',
			'Light',
			componentVariant,
			getTitle(card),
			link.dataset.eddlLandingItemLinkType || '_ERROR_',
			!link.textContent ? '_ERROR_' : link.textContent.trim(),
			'Button',
			totalLinks.length,
			totalLinks.indexOf(link) + 1
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} card - The Guide Card element.
 */
const guideCardHelper = (card: HTMLElement): void => {
	const parentRowContainer = card.closest('[data-eddl-landing-row]');
	const allCards = parentRowContainer
		? Array.from(
				parentRowContainer.querySelectorAll('[data-eddl-landing-item]')
		  )
		: [];
	const containerItemIndex = allCards.indexOf(card) + 1;
	const containerItems = allCards.length;
	const componentVariant =
		parentRowContainer &&
		(parentRowContainer as HTMLElement).dataset.eddlLandingRow
			? 'Standard'
			: 'Image and Description';
	const links = Array.from(card.querySelectorAll('a'));
	links.forEach((link) => {
		link.addEventListener(
			'click',
			guideCardLinkClickHandler(
				containerItems,
				containerItemIndex,
				links,
				card,
				componentVariant
			)
		);
	});
};

/**
 * Wire up component per cgdp requirments.
 */
const initialize = (): void => {
	const guideCardEls = document.querySelectorAll(
		'[data-eddl-landing-item="guide_card"]'
	);
	if (!guideCardEls.length) return;

	guideCardEls.forEach((guideCardEl) => {
		const guideCard = guideCardEl as HTMLElement;
		guideCardHelper(guideCard);
	});
};

export default initialize;
