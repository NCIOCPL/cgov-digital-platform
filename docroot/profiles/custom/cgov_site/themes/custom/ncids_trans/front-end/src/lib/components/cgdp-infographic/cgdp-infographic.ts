import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler for the infographic link click.
 */
const infographicLinkClickHandler = () =>
	(evt: Event) => {
		trackOther(
			'Body:EmbeddedMedia:Infographic:Print',
			'Body:EmbeddedMedia:Infographic:Print',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
			}
		);
	};

const infographicCreate = (infographicEl: HTMLElement) => {
	const links = Array.from(
		infographicEl.querySelectorAll('a')
	) as HTMLAnchorElement[];

	links.forEach((link) => {
		link.addEventListener(
			'click',
			infographicLinkClickHandler()
		);
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
