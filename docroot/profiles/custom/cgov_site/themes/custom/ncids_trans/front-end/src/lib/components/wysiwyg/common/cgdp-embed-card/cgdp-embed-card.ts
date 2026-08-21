import { trackOther } from '../../../../core/analytics/eddl-util';

const EMBEDDED_CARD_EVENT_NAME = 'Body:EmbeddedCard:LinkClick';
const CARD_SELECTOR =
	'.cgdp-embed-feature-card, .cgdp-recommended-content [data-eddl-landing-item="feature_card"], .cgdp-recommended-content [data-eddl-landing-item="imageless_card"]';

/**
 * Gets the exact location clicked that triggered the event.
 * @param {Event} evt - Click event
 */
const getLinkArea = (evt: Event): string => {
	const link = evt.target as HTMLElement;
	const tag = link.tagName;

	const tags: { [key: string]: string } = {
		IMG: 'Image',
		SPAN: 'Title',
		DIV: 'Description',
		P: 'Description',
	};

	return tags[tag];
};

/**
 * Gets the alignment of the embedded entity
 * @param {Event} embedElement - The embedded-entity element
 * Returns the alignment of the embedded entity based on the class being
 * applied to the parent element of the card
 */
const getCardAlignment = (embedElement: HTMLElement): string => {
	const alignments = {
		'align-left': 'Left',
		'align-center': 'Center',
		'align-right': 'Right',
	};

	for (const [className, alignment] of Object.entries(alignments)) {
		if (embedElement.classList.contains(className)) {
			return alignment;
		}
	}

	return 'None';
};

/**
 * Embedded card onclick handler.
 */
const embeddedCardLinkClickHandler = (evt: Event): void => {
	const card = evt.currentTarget as HTMLElement;
	const isRecommendedContent = Boolean(
		card.closest('.cgdp-recommended-content')
	);
	const linkAnchor = (
		card.matches('a') ? card : card.querySelector('a')
	) as HTMLElement;
	const cardTitle =
		card.querySelector('.nci-card__title')?.textContent?.trim() ||
		'Not Defined';
	const trackingData = {
		location: 'Body',
		componentType: isRecommendedContent
			? 'Recommended Content'
			: 'Embedded Card',
		linkType: linkAnchor.dataset.eddlLandingItemLinkType,
		cardType:
			linkAnchor.dataset.eddlLandingItem === 'imageless_card'
				? 'Imageless'
				: 'Feature',
		cardTitle,
	};

	if (isRecommendedContent) {
		trackOther(
			EMBEDDED_CARD_EVENT_NAME,
			EMBEDDED_CARD_EVENT_NAME,
			trackingData
		);
		return;
	}

	const embeddedEntity = card.closest('.embedded-entity') as HTMLElement;
	trackOther(EMBEDDED_CARD_EVENT_NAME, EMBEDDED_CARD_EVENT_NAME, {
		...trackingData,
		linkArea: getLinkArea(evt),
		cardAlignment: getCardAlignment(embeddedEntity),
	});
};

/**
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	const embedCardElements = document.querySelectorAll(CARD_SELECTOR);
	if (!embedCardElements.length) return;

	embedCardElements.forEach((cardElement) => {
		const embeddedCard = cardElement as HTMLElement;
		if (embeddedCard.dataset.embedCardAnalyticsInit === 'true') {
			return;
		}

		embeddedCard.dataset.embedCardAnalyticsInit = 'true';
		embeddedCard.addEventListener('click', embeddedCardLinkClickHandler);
	});
};

export default initialize;
