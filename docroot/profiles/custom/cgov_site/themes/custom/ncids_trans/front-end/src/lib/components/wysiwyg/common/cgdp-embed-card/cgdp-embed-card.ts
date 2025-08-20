import { trackOther } from '../../../../core/analytics/eddl-util';

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
	const link = evt.currentTarget as HTMLElement;
	const embeddedEntity = link.closest('.embedded-entity') as HTMLElement;
	const linkAnchor = link.querySelector('a') as HTMLElement;
	const cardTitle =
		link.querySelector('.nci-card__title')?.textContent || 'Not Defined';

	trackOther('Body:EmbeddedCard:LinkClick', 'Body:EmbeddedCard:LinkClick', {
		location: 'Body',
		componentType: 'Embedded Card',
		linkType: linkAnchor.dataset.eddlLandingItemLinkType,
		cardType:
			linkAnchor.dataset.eddlLandingItem === 'imageless_card'
				? 'Imageless'
				: 'Feature',
		cardTitle,
		linkArea: getLinkArea(evt),
		cardAlignment: getCardAlignment(embeddedEntity),
	});
};

/**
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	const embedCardElements = document.querySelectorAll('.cgdp-embed-card');
	if (!embedCardElements.length) return;

	embedCardElements.forEach((cardElement) => {
		const embeddedCard = cardElement as HTMLElement;
		embeddedCard.addEventListener('click', embeddedCardLinkClickHandler);
	});
};

export default initialize;
