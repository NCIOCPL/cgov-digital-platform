import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets the title of the imageless card group.
 * @param {HTMLElement} link - selected card.
 */
const getTitle = (link: HTMLElement): string => {
	const parentSection = link.closest('.usa-section');
	const title = parentSection?.querySelector(
		'.cgdp-imageless-card-group__heading'
	)?.textContent;
	return title?.trim() || 'Not Defined';
};

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
 * Gets text content of the exact link area.
 * @param {Event} evt - Click event
 */
const getGroupVariant = (link: HTMLElement): string => {
	const cardGroupContainer = link.closest('.cgdp-imageless-card-group');
	let cardGroupVariant = 'Not Defined';
	if (
		cardGroupContainer?.classList.contains(
			'cgdp-imageless-card-group--one-card'
		)
	) {
		cardGroupVariant = '1 Card Row';
	} else if (
		cardGroupContainer?.classList.contains(
			'cgdp-imageless-card-group--two-card'
		)
	) {
		cardGroupVariant = '2 Card Row';
	} else if (
		cardGroupContainer?.classList.contains(
			'cgdp-imageless-card-group--three-card'
		)
	) {
		cardGroupVariant = '3 Card Row';
	}

	return cardGroupVariant;
};

/**
 * Feature card on click handler.
 * @param {number} containerItems - Number of cards in row.
 * @param {number} containerItemIndex - Index of card selected in row.
 */
const imagelessCardLinkClickHandler =
	(containerItems: number, containerItemIndex: number | '_ERROR_') =>
	(evt: Event): void => {
		const link = evt.currentTarget as HTMLElement;

		landingClickTracker(
			link,
			'ImagelessCard', // linkName
			containerItems, // containerItems
			containerItemIndex, // containerItemsIndex
			'Imageless Card', // componentType
			'Not Defined', // componentTheme
			getGroupVariant(link), // componentVariant
			getTitle(link), // title
			link.dataset.eddlLandingItemLinkType || '_ERROR_', // linkType
			getLinkText(evt), // linkText
			getLinkArea(evt), // linkArea
			1, // totalLinks
			1 // linkPosition
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} card - The Feature Card element.
 */
const imagelessCardHelper = (card: HTMLElement): void => {
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
		imagelessCardLinkClickHandler(containerItems, containerItemIndex)
	);
};

/**
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	const imagelessCardEls = document.querySelectorAll(
		'[data-eddl-landing-item="imageless_card"]'
	);
	if (!imagelessCardEls.length) return;

	imagelessCardEls.forEach((imagelessCardEl) => {
		const imagelessCard = imagelessCardEl as HTMLElement;
		imagelessCardHelper(imagelessCard);
	});
};

export default initialize;
