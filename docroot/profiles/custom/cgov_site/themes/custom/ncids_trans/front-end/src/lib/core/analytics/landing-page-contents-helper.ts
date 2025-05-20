import { trackOther } from './eddl-util';

/**
 * Definition for page information object.
 */
interface PageInfo {
	/** The type of the page. Comes from dcterms.type <meta> tag. */
	pageType?: string;
	/** The template/page style of the page. Comes from cgdp.template <meta> tag. */
	pageTemplate?: string;
}

export const getLandingRowsAndColsInfo = (target: HTMLElement) => {
	// Get the total number of page rows by finding all rows on the page
	// and subtracting the rows within columns.
	const allRows = Array.from(
		document.querySelectorAll('[data-eddl-landing-row]')
	);
	const nestedRows = Array.from(
		document.querySelectorAll('[data-eddl-landing-row] [data-eddl-landing-row]')
	);
	const pageRows = allRows.filter((r) => nestedRows.indexOf(r) === -1);

	// Get the parent row of the clicked target, which might be in a column.
	const parentRowColContainer = target.closest('[data-eddl-landing-row-col]');

	// Now if there is a col we need to get the col's wrapping row.
	const parentRowContainer =
		parentRowColContainer !== null
			? parentRowColContainer.closest('[data-eddl-landing-row]')
			: target.closest('[data-eddl-landing-row]');

	/** Matched index from all rows on page to the target's parent row. */
	if (parentRowContainer === null) {
		// NOTE: There is a case in which pageRowCols and pageRowColIndex could be
		// considered _ERROR_ or something. This is probably good enough.
		return {
			pageRows: pageRows.length,
			pageRowIndex: '_ERROR_',
			pageRowCols: 0,
			pageRowColIndex: 0,
		};
	}

	// Get the index of the row within the page.
	const pageRowIndex = pageRows.indexOf(parentRowContainer) + 1;

	// Now find all the columns.
	const pageRowCols = Array.from(
		parentRowContainer.querySelectorAll('[data-eddl-landing-row-col]')
	);

	// If we do not have a column then there is no need to continue, only to
	// return the row information.
	if (pageRowCols.length === 0) {
		return {
			pageRows: pageRows.length,
			pageRowIndex: pageRowIndex,
			pageRowCols: 0,
			pageRowColIndex: 0,
		};
	}

	// There are columns within the row, but none that are
	// closest to the target.
	if (parentRowColContainer === null) {
		return {
			pageRows: pageRows.length,
			pageRowIndex: pageRowIndex,
			pageRowCols: pageRowCols.length,
			pageRowColIndex: '_ERROR_',
		};
	} else {
		return {
			pageRows: pageRows.length,
			pageRowIndex: pageRowIndex,
			pageRowCols: pageRowCols.length,
			pageRowColIndex: pageRowCols.indexOf(parentRowColContainer) + 1,
		};
	}
};

export const getContainerItemInfo = (target: HTMLElement) => {
	const col = target.closest('[data-eddl-landing-row-col]');
	if (col !== null) {
		const parentColRow = target.closest('[data-eddl-landing-row]');
		const colRows = Array.from(col.querySelectorAll('[data-eddl-landing-row]'));
		const colItemIndex = parentColRow
			? colRows.indexOf(parentColRow) + 1
			: '_ERROR_';
		return {
			containerItems: colRows.length,
			containerItemIndex: colItemIndex,
		};
	} else {
		return {
			containerItems: 1,
			containerItemIndex: 1,
		};
	}
};

/**
 * Gets information about the page from metadata.
 * @returns
 */
export const getPageInfo = (): PageInfo => {
	return {
		pageType: (
			document.querySelector('meta[name="dcterms.type"]') as HTMLMetaElement
		)?.content,
		pageTemplate: (
			document.querySelector('meta[name="cgdp.template"]') as HTMLMetaElement
		)?.content,
	};
};

/**
 * Gets the beginning string for an EDDL event name.
 * @param pageType The type of the page based on dcterms.type meta tag.
 * @returns The beginning string.
 */
export const getEventNameBeginning = (pageType: string | undefined) => {
	switch (pageType) {
		case 'cgvHomeLanding':
			return 'LP';
		case 'cgvMiniLanding':
			return 'MLP';
		default:
			return 'UNKNOWN';
	}
};

export const getRowVariant = (target: HTMLElement) => {
	const rowVariant = target.closest(
		'[data-eddl-landing-row-variant]'
	) as HTMLElement;
	if (rowVariant) {
		return rowVariant.dataset.eddlLandingRowVariant;
	}
	return 'Not Defined';
};

/**
 * Landing page click tracker helper.
 * @param {HTMLElement} target - Selected component.
 * @param {string} linkName - Link name from type of selected component.
 * @param {number} containerItems - Total number of components in the row of the
 *     selected component.
 * @param {number} containerItemIndex - Index of the selected component in the row.
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
 *     use "Not Defined". Truncated after 50 characters.
 * @param {string} linkArea - Exact target selected. Such as Title if the Title
 *     was clicked.  If the link area cannot be determined use "Not Defined".
 * @param {number} totalLinks - Total number of links shown on the component.
 * @param {number} linkPosition - The index of the link clicked in the card
 *     evaluated by counting the links top to bottom or left to right depending
 *     on the component.
 * @param {string} overrideEventType - The type of click event. Default is "LinkClick".
 */
export const landingClickTracker = (
	target: HTMLElement,
	linkName: string,
	containerItems: number | '_ERROR_',
	containerItemIndex: number | string,
	componentType: string,
	componentTheme: string,
	componentVariant: string,
	title: string,
	linkType: string,
	linkText: string,
	linkArea: string,
	totalLinks: number,
	linkPosition: number | string,
	overrideEventType = 'LinkClick'
) => {
	const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
		getLandingRowsAndColsInfo(target);

	const { pageType, pageTemplate } = getPageInfo();

	const eventNameStart = getEventNameBeginning(pageType);

	trackOther(
		`${eventNameStart}:${linkName}:${overrideEventType}`,
		`${eventNameStart}:${linkName}:${overrideEventType}`,
		{
			location: 'Body',
			pageType,
			pageTemplate,
			pageRowVariant: getRowVariant(target),
			pageRows,
			pageRowIndex,
			pageRowCols,
			pageRowColIndex,
			containerItems: containerItems,
			containerItemIndex: containerItemIndex,
			componentType: componentType,
			componentTheme: componentTheme,
			componentVariant: componentVariant,
			title: title.slice(0, 50),
			linkType: linkType,
			linkText: linkText.slice(0, 50),
			linkArea: linkArea,
			totalLinks: totalLinks,
			linkPosition: linkPosition,
		}
	);
};
