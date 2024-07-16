import {
	getContainerItemInfo,
	getLandingRowsAndColsInfo,
	getPageInfo,
	getEventNameBeginning,
} from '../../core/analytics/landing-page-contents-helper';
import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Landing page click tracker helper for raw html blocks.
 * @param {HTMLElement} target - Selected component.
 */
const rawHtmlClickTracker = (target: HTMLElement) => {
	const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
		getLandingRowsAndColsInfo(target);

	const { containerItems, containerItemIndex } = getContainerItemInfo(target);

	const { pageType, pageTemplate } = getPageInfo();

	/** Set values for data that cannot be altered. */
	const protectedData = {
		location: 'Body',
		componentType: 'Raw HTML',
		pageType,
		pageTemplate,
		pageRows,
		pageRowIndex,
		pageRowCols,
		pageRowColIndex,
		containerItems,
		containerItemIndex,
	};

	/** Title from data attribute. Truncated after 50 characters. */
	const title = target.dataset.eddlLandingRawhtmlTitle || 'Not Defined';

	/**  Text of target selected. Truncated after 50 characters. */
	const linkText = target.textContent ? target.textContent.trim() : '_ERROR_';

	// Get the raw html block. If we are in a column, we should get the
	// closest parent row that is in a column, if we get nothing, then
	// this raw html block is missing the data-eddl-landing-row attrib.
	const col = target.closest('[data-eddl-landing-row-col]');
	const rawHtmlBlock =
		col !== null
			? target.closest('[data-eddl-landing-row-col] [data-eddl-landing-row]')
			: target.closest('[data-eddl-landing-row]');

	// An array of all the links inside of the rawHtml
	const allLinks =
		rawHtmlBlock !== null
			? Array.from(rawHtmlBlock.querySelectorAll('[data-eddl-landing-rawhtml]'))
			: [];

	/** The index of the link clicked. */
	const linkPosition = allLinks.indexOf(target) + 1;

	/** Set values defaults for optional data attributes. */
	const defaultData = {
		componentTheme: 'Not Defined',
		componentVariant: 'Not Defined',
		title: title.slice(0, 50),
		linkArea: 'Raw HTML',
		linkText: linkText.slice(0, 50),
		linkType: 'Not Defined',
		totalLinks: allLinks.length,
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

	const eventNameStart = getEventNameBeginning(pageType);

	trackOther(
		`${eventNameStart}:RawHTML:LinkClick`,
		`${eventNameStart}:RawHTML:LinkClick`,
		{
			...defaultData,
			...overrideData,
			...protectedData,
		}
	);
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
