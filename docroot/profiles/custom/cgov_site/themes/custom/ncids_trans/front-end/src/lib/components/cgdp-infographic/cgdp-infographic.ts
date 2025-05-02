import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Gets the text of the nearest heading for an element
 * @param infographicEl - The element to start searching from.
 */
const getHeadingText = (infographicEl: HTMLElement): string => {
  const articleEl = infographicEl.closest('article');
  if (!articleEl) return '_ERROR_';

  const headingEls = Array.from(
    articleEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
  );

  let closestHeading: string | null = null;

  for (const heading of headingEls) {
    if (heading.compareDocumentPosition(infographicEl) & Node.DOCUMENT_POSITION_FOLLOWING) {
      closestHeading = heading.textContent?.trim() || null;
    } else {
      // Once we pass the infographic, stop looking — headings after infographic don't matter
      break;
    }
  }

  return closestHeading ?? '_ERROR_';
}

/**
 * Click handler for the infographic link click.
 */
const infographicLinkClickHandler = (parentHeading: string) =>
	(evt: Event) => {
		trackOther(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: parentHeading,
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
			infographicLinkClickHandler(getHeadingText(infographicEl))
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
