import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import footerInit from '../usa-footer';
import { usaFooterDomMock } from './usa-footer.dom.mock';

jest.mock('../../../core/analytics/eddl-util');

describe('usa-footer', () => {
	beforeEach(() => {
		// matchMedia not available in JSDOM
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation((query) => ({
				matches: query === '(min-width: 480px)',
				media: query,
				onchange: null,
				addListener: jest.fn(), // Deprecated
				removeListener: jest.fn(), // Deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			})),
		});
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends the correct analytics for link clicks', () => {
		const footer = usaFooterDomMock();

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const link = screen.getAllByRole('link');

		// Click Return to top
		fireEvent.click(link[0]);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: 'Back To Top',
			location: 'Footer',
			section: 'Back To Top',
		});

		// Click secondary link
		fireEvent.click(link[1]);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: 'About this Website',
			location: 'Footer',
			section: 'About',
		});

		// Click contact link
		fireEvent.click(link[14]);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: 'Live Chat',
			location: 'Footer',
			section: 'Contact Us',
		});

		// Click social icon
		fireEvent.click(link[18]);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: 'Facebook',
			location: 'Footer',
			section: 'Follow us',
		});

		// Click organization area
		fireEvent.click(link[23]);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: 'U.S. Department of Health and Human Services',
			location: 'Footer',
			section: 'OrganizationArea',
		});
	});

	it('sends the correct analytics on expand', () => {
		const footer = usaFooterDomMock();

		// Resize footer
		global.innerWidth = 400;
		window.dispatchEvent(new Event('resize'));

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const buttons = screen.getAllByRole('button', { expanded: false });

		// Click the link
		fireEvent.click(buttons[0]);

		expect(spy).toHaveBeenCalledTimes(1);

		expect(spy).toHaveBeenCalledWith(
			'Footer:SectionExpand',
			'Footer:SectionExpand',
			{
				linkText: 'Expand',
				location: 'Footer',
				section: 'About',
			}
		);
	});

	it('sends the correct analytics for form click', () => {
		const footer = usaFooterDomMock();

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const input = screen.getByRole('textbox');

		// Click the text field, twice
		fireEvent.click(input);
		fireEvent.click(input);

		// Analytics sent for clicking into input field
		expect(spy).toHaveBeenCalledWith('Form:Start', 'Form:Start', {
			formType: 'EmailSignUp',
			status: 'Start',
			location: 'Footer',
		});

		// Should have only been called once
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('sends the correct analytics for form error', () => {
		const footer = usaFooterDomMock();

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const input = screen.getByRole('textbox');
		const button = screen.getByRole('button', { name: 'Sign up' });

		// Change to invalid email address
		input.setAttribute('value', 'test');

		// Click the submit button
		fireEvent.click(button);

		// Invalid form submission
		expect(spy).toHaveBeenCalledWith('Form:Error', 'Form:Error', {
			formType: 'EmailSignUp',
			status: 'Error',
			location: 'Footer',
		});
	});

	it('sends the correct analytics for form submission', () => {
		const footer = usaFooterDomMock();

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const input = screen.getByRole('textbox');
		const button = screen.getByRole('button', { name: 'Sign up' });

		// Change to valid email address
		input.setAttribute('value', 'test@test.com');

		// Click the submit button
		fireEvent.click(button);

		// Valid form submission
		expect(spy).toHaveBeenCalledWith('Form:Complete', 'Form:Complete', {
			formType: 'EmailSignUp',
			status: 'Complete',
			location: 'Footer',
		});
	});

	it('sends the correct analytics for a bad html', () => {
		const footer = usaFooterDomMock();

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const link = screen.getByTestId('bad-link');
		fireEvent.click(link);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: '_ERROR_',
			location: 'Footer',
			section: '_ERROR_',
		});

		const social = screen.getByTestId('bad-social');
		fireEvent.click(social);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: '_ERROR_',
			location: 'Footer',
			section: '_ERROR_',
		});

		const contact = screen.getByTestId('bad-contact-link');
		fireEvent.click(contact);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: '_ERROR_',
			location: 'Footer',
			section: '_ERROR_',
		});

		const collapse = screen.getByTestId('bad-collapse');
		fireEvent.click(collapse);
		expect(spy).toHaveBeenCalledWith('Footer:LinkClick', 'Footer:LinkClick', {
			linkText: '_ERROR_',
			location: 'Footer',
			section: '_ERROR_',
		});
	});

	it('sends the correct analytics for a bad collapse', () => {
		const footer = usaFooterDomMock();

		// Resize footer
		global.innerWidth = 400;
		window.dispatchEvent(new Event('resize'));

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Create the footer JS
		footerInit();

		const buttons = screen.getAllByRole('button', { expanded: false });
		buttons[0].innerHTML = '';

		// Click the link
		fireEvent.click(buttons[0]);
		expect(spy).toHaveBeenCalledWith(
			'Footer:SectionExpand',
			'Footer:SectionExpand',
			{
				linkText: 'Expand',
				location: 'Footer',
				section: '_ERROR_',
			}
		);
	});

	it('does not blow up if there is no footer', () => {
		const noFooter = `
				<div>These aren't the footers you're looking for.</div>
			`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', noFooter);

		// Create the banner JS
		footerInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('has correctly translated validation alert', () => {
		const footer = usaFooterDomMock();

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', footer);

		// Change langcode of document to spanish
		document.documentElement.lang = 'es';

		// Create the banner JS
		footerInit();

		// Make an invalid submission
		const button = screen.getByRole('button', { name: 'Sign up' });
		fireEvent.click(button);

		const errorMsg = screen.getByRole('textbox', {
			description: 'Ingrese su dirección de correo electrónico',
		});
		expect(errorMsg).toBeInTheDocument();
	});
});
