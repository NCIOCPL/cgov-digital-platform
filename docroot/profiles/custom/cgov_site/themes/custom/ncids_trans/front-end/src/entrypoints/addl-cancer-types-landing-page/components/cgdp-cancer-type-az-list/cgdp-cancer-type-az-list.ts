import { getLandingRowsAndColsInfo } from '../../../../lib/core/analytics/landing-page-contents-helper';
import { trackOther } from '../../../../lib/core/analytics/eddl-util';
import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';

let accordionExpands = 0; // Tracks the number of expanded sections
let accordionCollapses = 0; // Tracks the number of collapses sections
let accordionFirstInteraction = true;

/**
 * Landing page click tracker helper for accordion.
 * @param {HTMLElement} target - Selected component.
 */
const accordionClickTracker = (target: HTMLElement) => {
	const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
		getLandingRowsAndColsInfo(target);

	const accordionSection = target.closest('.usa-accordion');
	const allContainers =
		accordionSection !== null
			? Array.from(accordionSection.querySelectorAll('.usa-accordion__content'))
			: [];
	const containerItems = allContainers.length;
	const currentContainer = target.closest('.usa-accordion__content');
	const containerItemIndex =
		currentContainer !== null ? allContainers.indexOf(currentContainer) + 1 : 0;

	/**  Text of target selected. Truncated after 50 characters. */
	const linkText = target.textContent ? target.textContent.trim() : '_ERROR_';

	// Get the raw html block. If we are in a column, we should get the
	// closest parent row that is in a column, if we get nothing, then
	// this raw html block is missing the data-eddl-landing-row attrib.
	const accordionContent = target.closest('.usa-accordion__content');

	// An array of all the links inside of the rawHtml
	const allLinks =
		accordionContent !== null
			? Array.from(accordionContent.querySelectorAll('.usa-link'))
			: [];

	/** The index of the link clicked. */
	const linkPosition = allLinks.indexOf(target) + 1;

	const linkArea =
		accordionContent?.previousElementSibling?.textContent?.trim();

	const href = target.getAttribute('href') || '';
	const linkType = href.startsWith('/') ? 'Internal' : 'External';

	const accordionButtons = document.querySelectorAll('.usa-accordion__button');
	const expandedButtons = Array.from(accordionButtons).filter(
		(button) => button.getAttribute('aria-expanded') === 'true'
	);
	const sectionsExpandedAtClick = expandedButtons.length;

	trackOther(`LP:RawHTMLAccordion:LinkClick`, `LP:RawHTMLAccordion:LinkClick`, {
		location: 'Body',
		componentType: 'Raw HTML',
		pageRows,
		pageRowIndex,
		pageRowCols,
		pageRowColIndex,
		containerItems,
		containerItemIndex,
		componentTheme: 'Not Defined',
		componentVariant: 'Accordion',
		title: 'Cancer Types A-Z Accordion',
		linkArea,
		linkText: linkText.slice(0, 50),
		linkType,
		totalLinks: allLinks.length,
		linkPosition,
		accordionExpands,
		accordionCollapses,
		sectionsExpandedAtClick,
		accordionAction: 'Link Click',
		accordionFirstInteraction,
	});
};

/**
 * Handles click events in accordion.
 * @param {Event} evt
 */
const accordionLinkClickHandler = (evt: Event): void => {
	const target = evt.currentTarget as HTMLElement;
	accordionClickTracker(target);
	updateAccordionFirstInteraction();
};

/**
 * Handles expand/collapse events in accordion.
 * @param {Event} evt
 */
const accordionExpandCollapseHandler = (evt: Event): void => {
	accordionExpandCollapseTracker(evt);
	updateAccordionFirstInteraction();
};

/**
 * Counter for Expands.
 * @param {Event} evt
 */
const accordionExpandCollapseTracker = (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;
	let accordionAction = '';
	if (target.getAttribute('aria-expanded') === 'false') {
		accordionCollapses += 1;
		accordionAction = 'Collapse';
	} else {
		accordionExpands += 1;
		accordionAction = 'Expand';
	}

	const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
		getLandingRowsAndColsInfo(target);

	const accordionSection = target.closest('.usa-accordion');
	const allContainers =
		accordionSection !== null
			? Array.from(accordionSection.querySelectorAll('.usa-accordion__heading'))
			: [];
	const containerItems = allContainers.length;
	const currentContainer = target.closest('.usa-accordion__heading');
	const containerItemIndex =
		currentContainer !== null ? allContainers.indexOf(currentContainer) + 1 : 0;

	const linkText = target.textContent ? target.textContent.trim() : '_ERROR_';

	trackOther(
		`LP:RawHTMLAccordion:ExpandCollapse`,
		`LP:RawHTMLAccordion:ExpandCollapse`,
		{
			location: 'Body',
			componentType: 'Raw HTML',
			pageRows,
			pageRowIndex,
			pageRowCols,
			pageRowColIndex,
			containerItems,
			containerItemIndex,
			componentTheme: 'Not Defined',
			componentVariant: 'Accordion',
			title: 'Cancer Types A-Z Accordion',
			linkArea: linkText,
			linkText,
			linkType: 'Anchor',
			accordionExpands,
			accordionCollapses,
			accordionAction,
			accordionFirstInteraction,
		}
	);
};

/**
 * Updates the first interaction variable.
 */
const updateAccordionFirstInteraction = (): void => {
	accordionFirstInteraction = false;
};

/**
 * Wires up component per cgdp requirements.
 */
const initialize = (): void => {
	const accordion = document.querySelector('.usa-accordion') as HTMLElement;
	USAAccordion.create(accordion, {
		allowMultipleOpen: true,
		openSections: [1],
	});
	const accordionAnchorTags = document.querySelectorAll('[az_list] a.usa-link');
	accordionAnchorTags.forEach((anchorTag) => {
		anchorTag.addEventListener('click', accordionLinkClickHandler);
	});

	// Add event listener for accordion expands
	const accordionButtons = document.querySelectorAll('.usa-accordion__button');
	accordionButtons.forEach((button) => {
		button.addEventListener('click', accordionExpandCollapseHandler);
	});
};

export default initialize;
