import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler for the infographic link click.
 */
const infographicLinkClickHandler = (link: HTMLAnchorElement) => () => {
	const mediaTitle = link.getAttribute('data-link_title') || '_ERROR_';

	trackOther('Body:EmbeddedMedia:LinkClick', 'Body:EmbeddedMedia:LinkClick', {
		location: 'Body',
		componentType: 'Embedded Infographic',
		mediaType: 'Infographic',
		mediaTitle: mediaTitle.slice(0, 50),
		linkText: 'View and Print Infographic',
		linkType: 'viewPrint',
	});
};

const infographicCreate = (infographicEl: HTMLElement) => {
	const links = Array.from(
		infographicEl.querySelectorAll('a')
	) as HTMLAnchorElement[];

	links.forEach((link) => {
		link.addEventListener('click', infographicLinkClickHandler(link));
	});
};

/**
 * Wires up the summary box for the cdgp requirements.
 */
const initialize = () => {
	const infographicEl = document.querySelector(
		'.cgdp-infographic'
	) as HTMLElement;

	if (infographicEl === null) return;

	infographicCreate(infographicEl);
};

export default initialize;
