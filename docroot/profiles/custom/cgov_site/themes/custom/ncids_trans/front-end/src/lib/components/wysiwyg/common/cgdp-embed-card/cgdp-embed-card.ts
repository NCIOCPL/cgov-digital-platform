import { trackOther } from '../../../../core/analytics/eddl-util';

const EMBEDDED_CARD_EVENT_NAME = 'Body:EmbeddedCard:LinkClick';
const CARD_SELECTOR =
	'.cgdp-embed-feature-card, .cgdp-recommended-content [data-eddl-landing-item="feature_card"], .cgdp-recommended-content [data-eddl-landing-item="imageless_card"]';

/**
 * Gets the exact location clicked that triggered the event.
 * @param {Event} evt - Click event
 */
const getLinkArea = (evt: Event): string => {
	const target = evt.target as HTMLElement;

	if (target.closest('.nci-card__title')) {
		return 'Title';
	}

	if (target.closest('.nci-card__image, picture')) {
		return 'Image';
	}

	return 'Description';
};

/**
 * Gets the alignment of the embedded entity
 * @param {HTMLElement} cardElement - The card or embedded-entity element
 * Returns the alignment of the embedded entity based on the class being
 * applied to the parent element of the card
 */
const getCardAlignment = (cardElement: HTMLElement): string => {
	const alignments = {
		'align-left': 'Left',
		'align-center': 'Center',
		'align-right': 'Right',
	};
	const alignedElement = cardElement.closest(
		'.align-left, .align-center, .align-right'
	);

	for (const [className, alignment] of Object.entries(alignments)) {
		if (alignedElement?.classList.contains(className)) {
			return alignment;
		}
	}

	return 'None';
};

/**
 * Embedded card onclick handler.
 */
const embeddedCardLinkClickHandler = (evt: Event): void => {
	// For WYSIWYG embeds, the listener is attached to the card container. For
	// recommended content, it is attached directly to the card's anchor.
	const card = evt.currentTarget as HTMLElement;

	// Both card contexts share this handler and event name, but analytics needs
	// a different componentType for cards in the recommended-content section.
	const isRecommendedContent = Boolean(
		card.closest('.cgdp-recommended-content')
	);

	// Normalize the two DOM structures to the anchor that owns the analytics
	// data attributes used for linkType and cardType.
	const linkAnchor = (
		card.matches('a') ? card : card.querySelector('a')
	) as HTMLElement;

	// Use the visible card title and provide the established analytics fallback
	// when a title is missing from the rendered card.
	const cardTitle =
		card.querySelector('.nci-card__title')?.textContent?.trim() ||
		'Not Defined';

	// Alignment classes live on the embedded entity for WYSIWYG cards, but can
	// live on an ancestor of the anchor for recommended-content cards.
	const alignmentElement = isRecommendedContent
		? card
		: (card.closest('.embedded-entity') as HTMLElement);

	// Build the common payload once so both card contexts emit the same EDDL
	// event schema, with only componentType varying by context.
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
		linkArea: getLinkArea(evt),
		cardAlignment: getCardAlignment(alignmentElement),
	};

	trackOther(EMBEDDED_CARD_EVENT_NAME, EMBEDDED_CARD_EVENT_NAME, trackingData);
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
