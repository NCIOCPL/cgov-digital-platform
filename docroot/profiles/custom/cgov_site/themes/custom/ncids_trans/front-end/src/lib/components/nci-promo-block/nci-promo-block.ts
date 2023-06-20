import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets the title of the PromoBlock
 * @param {HTMLElement} promoBlockElement - Clicked anchor element.
 */
const getTitle = (promoBlockElement: HTMLElement): string =>
	promoBlockElement.querySelector('.nci-promo-block__heading')?.textContent ||
	'_ERROR_';

/**
 * Gets the theme of the PromoBlock (Light / Dark)
 * @param {HTMLElement} promoBlockElement - The Promo Block
 */
const getPromoTheme = (promoBlockElement: HTMLElement): string =>
	promoBlockElement.classList.contains('nci-promo-block--dark')
		? 'Dark'
		: 'Light';

/**
 * Gets the variant of the PromoBlock (No Image / Image Left / Image Right)
 * @param {HTMLElement} promoBlockElement - The Promo Block
 */
const getPromoVariant = (promoBlockElement: HTMLElement): string => {
	if (promoBlockElement.classList.contains('nci-alternating-right')) {
		return 'Image Right';
	} else if (
		promoBlockElement.classList.contains('nci-promo-block--with-image')
	) {
		return 'Image Left';
	} else return 'No Image';
};

/**
 * Click handler for the language toggle click.
 * @param promoBlockElement the promo-block element.
 */
const promoBlockLinkClickHandler =
	(promoBlockElement: HTMLElement) => (evt: Event) => {
		const target = evt.currentTarget as HTMLElement;

		landingClickTracker(
			target,
			'PromoBlock', // linkName
			1, // rowItems
			1, // rowItemsIndex
			'Promo Block', // componentType
			getPromoTheme(promoBlockElement) as string, // componentTheme
			getPromoVariant(promoBlockElement) as string, // componentVariant
			getTitle(promoBlockElement) as string, // title
			target.dataset.eddlLandingItemLinkType || '_ERROR_', // linkType
			!target.textContent ? '_ERROR_' : target.textContent.trim(), // linkText
			'Button', // linkArea
			1, // totalLinks
			1 // linkPosition
		);
	};

/**
 * Wires up a promo-block for the cdgp requirements.
 */
const initialize = () => {
	const promoBlock = document.querySelectorAll(
		'[data-eddl-landing-item="promo_block"]'
	) as NodeListOf<HTMLElement>;
	if (!promoBlock.length) return;

	promoBlock.forEach((promo) => {
		const linkButton = promo.querySelector('a');
		if (!linkButton) return;
		linkButton.addEventListener('click', promoBlockLinkClickHandler(promo));
	});
};

export default initialize;
