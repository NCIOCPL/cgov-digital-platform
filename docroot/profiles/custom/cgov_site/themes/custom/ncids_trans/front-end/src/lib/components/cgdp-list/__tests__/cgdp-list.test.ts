import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpListInit from '../cgdp-list';
import { cgdpListDom } from './cgdp-list.dom';
import { cgdpListBadDom } from './cgdp-list.bad.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS List', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	beforeEach(() => {
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvMiniLanding">
			<meta name="cgdp.template" content="ncids_default">
			`
		);
	});

	it('sends analytics when item clicked on list', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpListDom);

		// Create the JS
		cgdpListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[2]);

		expect(spy).toHaveBeenCalledWith(
			'MLP:List:LinkClick',
			'MLP:List:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'List',
				componentTheme: 'Not Defined',
				componentVariant: 'Title, Description, and Image',
				title: 'Test Heading',
				linkType: 'Internal',
				linkText: 'Publications from the RAS Initiative',
				linkArea: 'Title',
				totalLinks: 6,
				linkPosition: 3,
			}
		);
	});

	it('sends error if missing link content', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpListBadDom);

		// Create the JS
		cgdpListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'MLP:List:LinkClick',
			'MLP:List:LinkClick',
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
				componentType: 'List',
				componentTheme: 'Not Defined',
				componentVariant: 'Title, Description, and Image',
				title: 'Test Heading',
				linkType: 'Internal',
				linkText: '_ERROR_',
				linkArea: 'Title',
				totalLinks: 3,
				linkPosition: 1,
			}
		);
	});

	it('sends error if missing heading text', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpListBadDom);

		// Create the JS
		cgdpListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[3]);

		expect(spy).toHaveBeenCalledWith(
			'MLP:List:LinkClick',
			'MLP:List:LinkClick',
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
				componentType: 'List',
				componentTheme: 'Not Defined',
				componentVariant: 'Title, Description, and Image',
				title: 'Not Defined',
				linkType: 'Internal',
				linkText: 'RAS Research Teams',
				linkArea: 'Title',
				totalLinks: 3,
				linkPosition: 1,
			}
		);
	});

	it('does not blow up when row does not exist', () => {
		const html = `<div data-eddl-landing-item="collection"><a href="#"></a></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpListInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('does not blow up when dynamic list do not exist', () => {
		const html = `<div data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpListInit();

		expect(spy).not.toHaveBeenCalled();
	});
});
