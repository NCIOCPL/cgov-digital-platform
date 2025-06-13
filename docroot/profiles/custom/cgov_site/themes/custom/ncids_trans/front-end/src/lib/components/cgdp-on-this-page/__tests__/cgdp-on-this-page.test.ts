import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpOnThisPageInit from '../cgdp-on-this-page';
import {
	cgdpOnThisPageDom,
	cgdpOnThisPageNoTitleDom,
	cgdpOnThisPageBadDom,
	cgdpOnThisPageNoListDom,
	cgdpOnThisPageNoLinkTextDom,
} from './cgdp-on-this-page.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS On This Page', () => {
	beforeEach(() => {
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvArticle">
			<meta name="cgdp.template" content="default">
			`
		);
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('should send analytics when the otp link is clicked', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpOnThisPageDom);

		// Create the JS
		cgdpOnThisPageInit();

		// Get links
		const otpLink = screen.getByText('Overwhelmed');

		// Click the link
		fireEvent.click(otpLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:OnThisPage:LinkClick',
			'Inner:OnThisPage:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'On This Page',
				title: 'Feelings and Cancer',
				linkType: 'Internal',
				linkText: 'Overwhelmed',
				totalLinks: 5,
				linkPosition: 1,
			}
		);
	});

	it('should send analytics when the otp link is clicked even if the page does not have a title', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpOnThisPageNoTitleDom);

		// Create the JS
		cgdpOnThisPageInit();

		// Get links
		const otpLink = screen.getByText('Overwhelmed');

		// Click the link
		fireEvent.click(otpLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:OnThisPage:LinkClick',
			'Inner:OnThisPage:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'On This Page',
				title: '_ERROR_',
				linkType: 'Internal',
				linkText: 'Overwhelmed',
				totalLinks: 5,
				linkPosition: 1,
			}
		);
	});

	it('should send analytics when the otp link is clicked and it does not have text', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpOnThisPageNoLinkTextDom);

		// Create the JS
		cgdpOnThisPageInit();

		// Get links
		const otpLink = screen.getByTestId('first-link');

		// Click the link
		fireEvent.click(otpLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:OnThisPage:LinkClick',
			'Inner:OnThisPage:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'On This Page',
				title: 'Feelings and Cancer',
				linkType: 'Internal',
				linkText: '_ERROR_',
				totalLinks: 5,
				linkPosition: 1,
			}
		);
	});

	it('should not break if on this page element does not exist', async () => {
		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpOnThisPageBadDom);

		// Create the JS
		cgdpOnThisPageInit();

		// Get links
		const otpLink = screen.getByText('Overwhelmed');

		expect(otpLink).toBeInTheDocument();
	});

	it('should not break if on this page element does not have a list', async () => {
		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpOnThisPageNoListDom);

		// Create the JS
		cgdpOnThisPageInit();

		// Get links
		const otpLink = screen.getByText('Overwhelmed');

		expect(otpLink).toBeInTheDocument();
	});
});
