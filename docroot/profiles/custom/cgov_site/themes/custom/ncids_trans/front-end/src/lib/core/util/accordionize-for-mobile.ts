import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';

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
