import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import { cgdpWideGuideCardDom } from './cgdp-wide-guide-card.dom';
import { cgdpWideGuideCardBadDom } from './cgdp-wide-guide-card.bad.dom';
import cgdpWideGuideCard from '../cgdp-wide-guide-card';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Wide Guide Card', () => {
	beforeEach(() => {
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvMiniLanding">
			<meta name="cgdp.template" content="ncids_default">
			`
		);
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends analytics when internal link clicked', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpWideGuideCardDom);

		// Create the JS
		cgdpWideGuideCard();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'MLP:WideGuideCard:LinkClick',
			'MLP:WideGuideCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Wide Guide Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Optional Heading for Wide Guide Card',
				linkType: 'Internal',
				linkText: 'Cancer Homepage',
				linkArea: 'Button',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('sends analytics when external link clicked', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpWideGuideCardDom);

		// Create the JS
		cgdpWideGuideCard();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[2]);

		expect(spy).toHaveBeenCalledWith(
			'MLP:WideGuideCard:LinkClick',
			'MLP:WideGuideCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Wide Guide Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'External',
				linkText: 'External Link to Google',
				linkArea: 'Button',
				totalLinks: 3,
				linkPosition: 2,
			}
		);
	});

	it('sends error if missing link content', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpWideGuideCardBadDom);

		// Create the JS
		cgdpWideGuideCard();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'MLP:WideGuideCard:LinkClick',
			'MLP:WideGuideCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Wide Guide Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Optional Heading for Wide Guide Card',
				linkType: '_ERROR_',
				linkText: '_ERROR_',
				linkArea: 'Button',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('does not blow up when WGC does not exist', () => {
		const html = `<div data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpWideGuideCard();

		expect(spy).not.toHaveBeenCalled();
	});
});
