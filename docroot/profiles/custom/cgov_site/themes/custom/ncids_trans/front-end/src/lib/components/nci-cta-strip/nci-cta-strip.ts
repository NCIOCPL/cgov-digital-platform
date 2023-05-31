import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Component onclick handler.
 * @param {HTMLElement[]} totalLinks - All links in cta strip.
 */
const ctaLinkClickHandler =
	() =>
	(evt: Event): void => {
		const link = evt.currentTarget as HTMLElement;

		landingClickTracker(
			link,
			'CTAStrip',
			1,
			1,
			'CTA Strip',
			'Dark',
			'Standard',
			'Call to Action Strip',
			link.dataset.eddlLandingItemLinkType || '_ERROR_',
			!link.textContent ? '_ERROR_' : link.textContent.trim(),
			'Button',
			getLinks(link).length,
			getLinks(link).indexOf(link) + 1
		);
	};

/**
 * Get all links in cta.
 * @param {HTMLElement} link - Selected link.
 */
const getLinks = (link: HTMLElement): HTMLElement[] => {
	const parent = link.closest('[data-eddl-landing-row]');
	if (parent) {
		return Array.from(parent.querySelectorAll('a'));
	} else {
		return [];
	}
};

/**
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	const ctas = document.querySelectorAll(
		'[data-eddl-landing-item="cta_strip"] a'
	);
	if (!ctas.length) return;

	const links = Array.from(ctas);
	links.forEach((link) => {
		link.addEventListener('click', ctaLinkClickHandler());
	});
};

export default initialize;
