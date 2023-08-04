import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets the title of the Hero (CTA Tagline)
 * @param {HTMLElement} nciHeroElement - The NCI Hero Element
 */
const getHeroTitle = (nciHeroElement: HTMLElement): string =>
	nciHeroElement
		.querySelector('.nci-hero__cta-container')
		?.querySelector('.nci-hero__cta')
		?.querySelector('.nci-hero__cta-tagline')?.textContent || '_ERROR_';

/**
 * Gets the theme of the Hero (Light / Dark)
 * @param {HTMLElement} nciHeroElement - The Hero
 */
const getHeroTheme = (nciHeroElement: HTMLElement): string => {
	const isDark = Boolean(
		nciHeroElement
			.querySelector('.nci-hero__cta-container')
			?.querySelector('.nci-hero__cta--dark')
	);
	if (isDark) return 'Dark';
	return 'Light';
};
/**
 * Gets the Variant of the Hero (With(out) CTA Strip/Button)
 * Confirms whether Hero has a CTA Strip, CTA Button, or Both
 * @param {HTMLElement} nciHeroElement - The NCI Hero Element
 */
const getHeroVariant = (nciHeroElement: HTMLElement): string => {
	const heroCtaHasButton = Boolean(
		nciHeroElement
			.querySelector('.nci-hero__cta-container')
			?.querySelector('.nci-hero__cta--with-button')
	);
	const heroHasCtaStrip = Boolean(
		nciHeroElement.classList.contains('nci-hero--with-cta-strip')
	);
	if (heroCtaHasButton && heroHasCtaStrip) {
		return 'Button with CTA Strip';
	} else if (heroCtaHasButton) {
		return 'Button with no CTA Strip';
	} else if (heroHasCtaStrip) {
		return 'No Button with CTA Strip';
	} else {
		return '_ERROR_';
	}
};

/**
 * Checks the Link Area of the Hero (Primary/Secondary Button)
 * Primary Button accompanies the CTA (returns True)
 * Secondary Buttons are in the CTA Strip (returns False)
 * @param {HTMLElement} linkTarget - Clicked anchor element.
 */
const checkHeroLinkArea = (linkTarget: HTMLElement): boolean =>
	Boolean(linkTarget.closest('.nci-hero__cta'));

/**
 * Gets the Link Position of the clicked link of the Hero
 * Positions: (1,1) for CTA button, (2,[index in CTA string]) for CTA Strip buttons
 * @param {HTMLElement} linkTarget - Clicked anchor element.
 */
const getHeroLinkPosition = (linkTarget: HTMLElement): string => {
	// The CTA Strip
	const ctaStrip = linkTarget.closest('.nci-cta-strip');
	// The List Element (Parent of Anchor)
	const anchorElementParent = linkTarget.closest('li');
	// Array of CTA Strip Elements
	const ctaStripElementArray = Array.from(ctaStrip?.children || []);

	if (ctaStripElementArray.length < 1) {
		return '1-1';
	} else if (anchorElementParent) {
		return `2-${ctaStripElementArray.indexOf(anchorElementParent) + 1}`;
	} else {
		return '_ERROR_';
	}
};

/**
 * Click handler for the language toggle click.
 * @param nciHero the hero element.
 * @param totalLinks the total numbe of links in the hero.
 */
const nciHeroLinkClickHandler =
	(nciHero: HTMLElement, totalLinks: number) => (evt: Event) => {
		const target = evt.currentTarget as HTMLElement;

		landingClickTracker(
			target,
			'Hero', // linkName
			1, // rowItems
			1, // rowItemsIndex
			'Hero', // componentType
			getHeroTheme(nciHero) as string, // componentTheme
			getHeroVariant(nciHero) as string, // componentVariant
			getHeroTitle(nciHero) as string, // title
			target.dataset.eddlLandingItemLinkType || '_ERROR_', // linkType
			!target.textContent ? '_ERROR_' : target.textContent.trim(), // linkText
			checkHeroLinkArea(target) ? 'Primary Button' : 'Secondary Button', // linkArea
			totalLinks, // totalLinks
			getHeroLinkPosition(target) // linkPosition
		);
	};

/**
 * Wires up a hero for the cdgp requirements.
 */
const initialize = () => {
	const nciHero = document.querySelectorAll(
		'[data-eddl-landing-item="hero"]'
	) as NodeListOf<HTMLElement>;
	if (!nciHero.length) return;

	nciHero.forEach((hero) => {
		const linkButton = hero.querySelectorAll('a');
		if (!linkButton.length) return;
		linkButton.forEach((link) =>
			link.addEventListener(
				'click',
				nciHeroLinkClickHandler(hero, linkButton.length)
			)
		);
	});
};

export default initialize;
