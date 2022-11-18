import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Tracks a breadcrumb link click.
 * @param linkText The text of the link.
 * @param section The value of the hierarchy of the link clicked. If the top-level link is clicked, return L1. If the second link is clicked, return L2
 */
const track = (linkText: string, section: string) => {
	trackOther('Breadcrumbs:LinkClick', 'Breadcrumbs:LinkClick', {
		linkText,
		location: 'Breadcrumbs',
		section,
	});
};

/**
 * Gets the level of the clicked breadcrumb item.
 * @param breadcrumbNav The breadcrumb navigation element.
 * @param clickedLink The link element that was clicked.
 */
const getClickLevel = (
	breadcrumbNav: HTMLElement,
	clickedLink: HTMLAnchorElement
) => {
	const links = breadcrumbNav.querySelectorAll(
		'li.usa-breadcrumb__list-item a.usa-breadcrumb__link'
	) as NodeListOf<HTMLAnchorElement>;

	const level = Array.from(links).findIndex((link) => {
		return clickedLink === link;
	});

	return 'L' + (level + 1);
};

/**
 * Click handler for the language toggle click.
 */
const breadcrumbLinkAnalyticsHandler =
	(breadcrumbNav: HTMLElement) => (event: Event) => {
		const target = event.currentTarget as HTMLAnchorElement;
		const linkText = (target.textContent as string).trim() || '_ERROR_';
		const section = getClickLevel(breadcrumbNav, target);
		track(linkText, section);
	};

/**
 * Wires up a usa-breadcrumbs for the cdgp requirements.
 */
const initialize = () => {
	const breadcrumbNav = document.querySelector(
		'nav.usa-breadcrumb'
	) as HTMLElement;
	if (!breadcrumbNav) return;

	const navLinks = breadcrumbNav.querySelectorAll('a');
	navLinks.forEach((link) => {
		link.addEventListener(
			'click',
			breadcrumbLinkAnalyticsHandler(breadcrumbNav)
		);
	});
};

export default initialize;
