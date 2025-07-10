import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';

import { trackOther } from '../../core/analytics/eddl-util';
import { getPageInfo } from '../../core/analytics/landing-page-contents-helper';

/**
 * Funciton to make analytics call when accordion button is clicked
 * @param accordionButtons The buttons which expand / collapse the accordion
 * @param accordionPreviouslyOpened The boolean tracking whether this is the first interaction
 * @param evt The click event which we're getting the event target from
 */
export const accordionAnalyticsHandler = (
	accordionButtons: HTMLElement[],
	accordionPreviouslyOpened: boolean,
	componentType: string,
	evt: Event
) => {
	const target = evt.currentTarget as HTMLElement;

	const { pageType, pageTemplate } = getPageInfo();

	// Get the title of the article page
	const pageTitle = target.closest('article')?.querySelector('h1')?.textContent;

	// Find if the accordion is being expanded or collapsed
	const accordionAction =
		target.getAttribute('aria-expanded') === 'false' ? 'Collapse' : 'Expand';

	trackOther(
		'Inner:Accordion:ExpandCollapse',
		'Inner:Accordion:ExpandCollapse',
		{
			location: 'Body',
			componentType,
			accordionAction: accordionAction,
			accordionLinkText: !target.textContent
				? '_ERROR_'
				: target.textContent.trim().slice(0, 50),
			accordionFirstInteraction: !accordionPreviouslyOpened,
			title: !pageTitle ? '_ERROR_' : pageTitle.trim().slice(0, 50),
			linkType: 'accordion',
			totalAccordionItems: accordionButtons.length,
			accordionLinkPosition: accordionButtons.indexOf(target) + 1,
			pageType,
			pageTemplate,
		}
	);
};

// This function is used to create an accordion for mobile devices.
// It listens for the window's resize event and initializes or destroys the accordion
// based on the window's width.
export const accordionizeForMobile = (
	selector: string,
	accordionInstance: USAAccordion | null
) => {
	const articleBody = document.querySelector(selector) as HTMLElement;
	if (!articleBody) return;

	// Listen for window's resize event
	window.addEventListener('resize', () => {
		if (window.innerWidth < 640 && articleBody) {
			if (accordionInstance !== null) return;

			// Initialize the accordion
			articleBody.classList.add('usa-accordion');
			accordionInstance = USAAccordion.create(articleBody, {
				allowMultipleOpen: true,
				openSections: [],
			});
		} else {
			// Destroy the accordion
			if (accordionInstance !== null) {
				accordionInstance.unregister();
				accordionInstance = null;
				articleBody.classList.remove('usa-accordion');
			}
		}
	});

	if (window.innerWidth < 640) {
		articleBody.classList.add('usa-accordion');
		if (accordionInstance === null)
			accordionInstance = USAAccordion.create(articleBody, {
				allowMultipleOpen: true,
				openSections: [],
			});
	}
	return accordionInstance || null;
};
