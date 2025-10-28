import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Enum for the type of link.
 */
enum LinkTypes {
	/** For external links */
	External = 'External',
	/** For mailto links */
	Email = 'Email',
	/** For internal links (managed and unmanaged) */
	Internal = 'Internal',
	/** For glossified links */
	Glossified = 'Glossified',
	/** For managed media links */
	Media = 'Media',
	/** For any other link with a protocol */
	Other = 'Other',
}

/**
 * Gets the analytics type for a link.
 * @param link the link that was clicked.
 * @returns the type
 */
const getLinkType = (link: HTMLAnchorElement): LinkTypes => {
	if (link.classList.contains('cgdp-definition-link')) {
		return LinkTypes.Glossified;
	}

	switch (link.protocol) {
		case 'http:':
		case 'https:': {
			if (link.hostname === window.location.hostname) {
				if (link.dataset.entityType === 'media') {
					return LinkTypes.Media;
				} else {
					return LinkTypes.Internal;
				}
			} else {
				return LinkTypes.External;
			}
		}
		case 'mailto:':
			return LinkTypes.Email;
		default:
			return LinkTypes.Other;
	}
};

/**
 * Body Link Click Handler
 * @param totalLinks
 * @param sectionIndex
 * @param location
 * @returns
 */
const bodyLinkClickHandler =
	(totalLinks: HTMLAnchorElement[], sectionIndex: number) => (evt: Event) => {
		const target = evt.currentTarget as HTMLAnchorElement;
		const analyticsEventName = 'Inner:WYSIWYG:LinkClick';
		const linkType = getLinkType(target);
		const linkText = target.textContent?.trim() || '_ERROR_';
		const linkPosition = totalLinks.indexOf(target) + 1;

		const trackingObject = {
			location: 'Body',
			componentType: 'WYSIWYG',
			linkType,
			linkText,
			totalLinks: totalLinks.length,
			sectionIndex: sectionIndex + 1,
			linkPosition,
		};
		trackOther(analyticsEventName, analyticsEventName, trackingObject);
	};

/**
 * Body Link Analytics Helper
 * @param bodySection
 * @param sectionIndex
 * @param classString
 */
export const bodyLinkAnalyticsHelper = (
	bodySection: HTMLElement,
	sectionIndex: number,
	classString?: string
) => {
	const className = classString || '.usa-prose--ncids-full-html';
	const wysiwygBlocks = bodySection.querySelectorAll(
		className
	) as NodeListOf<HTMLElement>;

	wysiwygBlocks.forEach((block) => {
		const allLinks = Array.from(
			block.querySelectorAll('a')
		) as HTMLAnchorElement[];

		const filteredLinks = allLinks.filter((link) => {
			return !link.closest('[data-embed-button]');
		});

		filteredLinks.forEach((link) => {
			link.addEventListener(
				'click',
				bodyLinkClickHandler(filteredLinks, sectionIndex)
			);
		});
	});
};
