import { trackOther } from './eddl-util';

/**
 * Landing page click tracker helper.
 * @param {HTMLElement} target - Selected component.
 * @param {string} linkName - Link name from type of selected component.
 * @param {number} rowItems - Total number of components in the row of the
 *     selected component.
 * @param {number} rowItemIndex - Index of the selected component in the row.
 * @param {string} componentType - Type of the selected component such as Promo
 *     Block, Feature Cards, etc.
 * @param {string} componentTheme - "Light" or "Dark". In cases where a theme
 *     option is not yet available, this should match the available theme color.
 * @param {string} componentVariant - Selected component variant out of design
 *     options available for a component type.
 * @param {string} title - Title field displayed - regardless if this was the
 *     selected target or not. This value should be truncated after 50
 *     characters.
 * @param {string} linkType - Type of link based on the selected component such
 *     as "Internal", "External", or "Media".
 * @param {string} linkText - Text of target selected. Value will vary based on
 *     the link area and component type. If the link area cannot be determined
 *     use "Undefined". Truncated after 50 characters.
 * @param {string} linkArea - Exact target selected. Such as Title if the Title
 *     was clicked.  If the link area cannot be determined use "Undefined".
 * @param {number} totalLinks - Total number of links shown on the component.
 * @param {number} linkPosition - The index of the link clicked in the card
 *     evaluated by counting the links top to bottom or left to right depending
 *     on the component.
 */
export const landingClickTracker = (
	target: HTMLElement,
	linkName: string,
	rowItems: number | '_ERROR_',
	rowItemIndex: number | '_ERROR_',
	componentType: string,
	componentTheme: string,
	componentVariant: string,
	title: string,
	linkType: string,
	linkText: string,
	linkArea: string,
	totalLinks: number,
	linkPosition: number
) => {
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

	trackOther(`LP:${linkName}:LinkClick`, `LP:${linkName}:LinkClick`, {
		location: 'Body',
		pageRows: pageRows.length,
		pageRowIndex: pageRowIndex,
		rowItems: rowItems,
		rowItemIndex: rowItemIndex,
		componentType: componentType,
		componentTheme: componentTheme,
		componentVariant: componentVariant,
		title: title.slice(0, 50),
		linkType: linkType,
		linkText: linkText.slice(0, 50),
		linkArea: linkArea,
		totalLinks: totalLinks,
		linkPosition: linkPosition,
	});
};
