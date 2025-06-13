import { accordionizeForMobile } from '../accordionize-for-mobile';
import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { accordionNotPresentOnPage } from './mobile-accordion.dom';

describe('accordionizeForMobile function', () => {
	beforeEach(() => {
		// Mocking window.innerWidth
		// matchMedia not available in JSDOM
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation((query) => ({
				matches: query === '(min-width: 640px)',
				media: query,
				onchange: null,
				addListener: jest.fn(), // Deprecated
				removeListener: jest.fn(), // Deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			})),
		});

		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvArticle">
			<meta name="cgdp.template" content="default">
			`
		);

		// Set window width to greater than 640px so the
		// accordionize function can check the width on resize
		global.innerWidth = 1024;
	});

	afterEach(() => {
		document.getElementsByTagName('body')[0].innerHTML = '';
		// Reset window width to greater than 640px so the
		// accordionize function can check the width on resize
		global.innerWidth = 1024;
		jest.resetAllMocks();
	});

	// Should add usa-accordion class when window goes to mobile
	it('should initialize accordion when window width is less than 640', () => {
		document.body.insertAdjacentHTML('beforeend', accordionNotPresentOnPage);
		const articleBody = document.querySelector(
			'.cgdp-related-resources'
		) as HTMLElement;

		// Will return nothing as window is too big to initialize
		accordionizeForMobile('.cgdp-related-resources', null);

		// Resize Event for Accordionize Logic
		// Class is added in resize event listener
		global.innerWidth = 400;
		window.dispatchEvent(new Event('resize'));

		expect(articleBody).toHaveClass('usa-accordion');
	});

	//
	it('should remove accordion class when window width is greater than or equal to 640', () => {
		global.innerWidth = 400;
		document.body.insertAdjacentHTML('beforeend', accordionNotPresentOnPage);
		const articleBody = document.querySelector(
			'.cgdp-related-resources'
		) as HTMLElement;

		accordionizeForMobile('.cgdp-related-resources', null);

		// Resize Event for Accordionize Logic
		global.innerWidth = 1024;
		window.dispatchEvent(new Event('resize'));

		expect(articleBody).not.toHaveClass('usa-accordion');
	});

	it('should not break when a selector is missing and the usa-accordion class should not be applied', () => {
		document.body.insertAdjacentHTML('beforeend', accordionNotPresentOnPage);
		const articleBody = document.querySelector(
			'.cgdp-related-resources'
		) as HTMLElement;

		accordionizeForMobile('.not-real-selector', null);

		expect(articleBody).not.toHaveClass('usa-accordion');
	});

	it('should not break when an accordion already exists', () => {
		let accordionInstance: USAAccordion | null = null;
		document.body.insertAdjacentHTML('beforeend', accordionNotPresentOnPage);
		const articleBody = document.querySelector(
			'.cgdp-related-resources'
		) as HTMLElement;

		// Create an Accordion Instance
		accordionInstance = USAAccordion.create(articleBody, {
			allowMultipleOpen: true,
			openSections: [],
		});

		accordionInstance =
			(accordionizeForMobile(
				'.cgdp-related-resources',
				accordionInstance
			) as USAAccordion) || null;

		// Resize Event for Accordionize Logic
		global.innerWidth = 480;
		window.dispatchEvent(new Event('resize'));

		expect(articleBody).not.toHaveClass('usa-accordion');
		expect(accordionInstance).toBeDefined();
	});
});
