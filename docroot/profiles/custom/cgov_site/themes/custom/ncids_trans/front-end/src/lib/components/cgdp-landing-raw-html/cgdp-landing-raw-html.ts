import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Landing page click tracker helper for raw html blocks.
 * @param {HTMLElement} target - Selected component.
 */
const rawHtmlClickTracker = (target: HTMLElement) => {
	/** Total number of rows on the landing page overall. */
	const pageRows = Array.from(
		document.querySelectorAll('[data-eddl-landing-row]')
	);

	/** Parent row of the clicked target. */
	const parentRowContainer = target.closest('[data-eddl-landing-row]');

	/** Matched index from all rows on page to the target's parent row. */
	const pageRowIndex = parentRowContainer
		? pageRows.indexOf(parentRowContainer) + 1
		: '_ERROR_';

	/** Title from data attribute. Truncated after 50 characters. */
	const title = target.dataset.eddlLandingRawhtmlTitle || 'Not Defined';

	/**  Text of target selected. Truncated after 50 characters. */
	const linkText = target.textContent ? target.textContent.trim() : '_ERROR_';

	/** Total number of links shown in the row. */
	const totalLinks = parentRowContainer
		? Array.from(
				parentRowContainer.querySelectorAll('[data-eddl-landing-rawhtml]')
		  )
		: [];

	/** The index of the link clicked. */
	const linkPosition = totalLinks.indexOf(target) + 1;

	/** Set values for data that cannot be altered. */
	const protectedData = {
		location: 'Body',
		componentType: 'Raw HTML',
		pageRows: pageRows.length,
		pageRowIndex: pageRowIndex,
	};

	/** Set values defaults for optional data attributes. */
	const defaultData = {
		componentTheme: 'Not Defined',
		componentVariant: 'Not Defined',
		title: title.slice(0, 50),
		linkArea: 'Raw HTML',
		linkText: linkText.slice(0, 50),
		linkType: 'Not Defined',
		rowItems: 1,
		rowItemIndex: 1,
		totalLinks: totalLinks.length,
		linkPosition: linkPosition,
	};

	/** Override values retrieved from data attributes. */
	const overrideData = Object.entries(target.dataset).reduce(
		(ac, [key, val]) => {
			if (!key.match(/^eddlLandingRawhtml.+/)) {
				return ac;
			}
			const cleanName = key.replace(/^eddlLandingRawhtml/, '');
			return {
				...ac,
				[cleanName[0].toLowerCase() + cleanName.slice(1)]: val,
			};
		},
		{}
	);

	trackOther(`LP:RawHTML:LinkClick`, `LP:RawHTML:LinkClick`, {
		...defaultData,
		...overrideData,
		...protectedData,
	});
};

/**
 * Handles click events in raw html blocks.
 * @param {Event} evt
 */
const rawHtmlLinkClickHandler = (evt: Event): void => {
	const target = evt.currentTarget as HTMLElement;
	rawHtmlClickTracker(target);
};

/**
 * Wires up component per cgdp requirements.
 */
const initialize = (): void => {
	const links = document.querySelectorAll('[data-eddl-landing-rawhtml]');
	links.forEach((link) => {
		link.addEventListener('click', rawHtmlLinkClickHandler);
	});
};

export default initialize;
