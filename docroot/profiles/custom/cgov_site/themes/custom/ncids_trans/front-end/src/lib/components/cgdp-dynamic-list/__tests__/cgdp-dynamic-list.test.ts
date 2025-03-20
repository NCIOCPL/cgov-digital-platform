import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpDynamicListInit from '../cgdp-dynamic-list';
import { cgdpDynamicListDom } from './cgdp-dynamic-list.dom';
import { cgdpDynamicListBadDom } from './cgdp-dynamic-list.bad.dom';
import { cgdpDynamicListNoDataDom } from './cgdp-dynamic-list-no-data.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Dynamic List', () => {
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
			<meta name="dcterms.type" content="cgvHomeLanding">
			<meta name="cgdp.template" content="ncids_without_title">
			`
		);
	});

	it('sends analytics when collection item clicked on dynamic list', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpDynamicListDom);

		// Create the JS
		cgdpDynamicListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[2]);

		expect(spy).toHaveBeenCalledWith(
			'LP:Collection:LinkClick',
			'LP:Collection:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Dynamic List',
				componentTheme: 'NCDIS Collection Media',
				componentVariant: 'Press Releases',
				title: 'Recent Press Releases',
				linkType: 'Internal',
				linkText: 'Norman Sharpless sworn in as director of the Natio',
				linkArea: 'Collection Item',
				totalLinks: 6,
				linkPosition: 3,
			}
		);
	});

	it('sends analytics when view all button clicked on dynamic list', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpDynamicListDom);

		// Create the JS
		cgdpDynamicListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[5]);

		expect(spy).toHaveBeenCalledWith(
			'LP:Collection:LinkClick',
			'LP:Collection:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Dynamic List',
				componentTheme: 'NCDIS Collection Media',
				componentVariant: 'Press Releases',
				title: 'Recent Press Releases',
				linkType: 'Internal',
				linkText: 'All NCI News',
				linkArea: 'View All Button',
				totalLinks: 6,
				linkPosition: 6,
			}
		);
	});

	it('sends error if missing link content', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpDynamicListBadDom);

		// Create the JS
		cgdpDynamicListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'LP:Collection:LinkClick',
			'LP:Collection:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 3,
				containerItemIndex: 1,
				componentType: 'Dynamic List',
				componentTheme: 'NCDIS Collection Media',
				componentVariant: 'Press Releases',
				title: 'Recent Press Releases',
				linkType: 'Internal',
				linkText: '_ERROR_',
				linkArea: 'Collection Item',
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('sends error if missing heading text', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpDynamicListBadDom);

		// Create the JS
		cgdpDynamicListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[8]);

		expect(spy).toHaveBeenCalledWith(
			'LP:Collection:LinkClick',
			'LP:Collection:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 3,
				containerItemIndex: 2,
				componentType: 'Dynamic List',
				componentTheme: 'NCDIS Collection Media',
				componentVariant: 'Press Releases',
				title: 'No Title',
				linkType: 'Internal',
				linkText: 'Norman Sharpless sworn in as director of the Natio',
				linkArea: 'Collection Item',
				totalLinks: 6,
				linkPosition: 3,
			}
		);
	});

	it('sends error if missing heading element', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpDynamicListBadDom);

		// Create the JS
		cgdpDynamicListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[14]);

		expect(spy).toHaveBeenCalledWith(
			'LP:Collection:LinkClick',
			'LP:Collection:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 3,
				containerItemIndex: 3,
				componentType: 'Dynamic List',
				componentTheme: 'NCDIS Collection Media',
				componentVariant: 'Press Releases',
				title: 'No Title',
				linkType: 'Internal',
				linkText: 'Norman Sharpless sworn in as director of the Natio',
				linkArea: 'Collection Item',
				totalLinks: 6,
				linkPosition: 3,
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
		cgdpDynamicListInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('does not blow up when dynamic list do not exist', () => {
		const html = `<div data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpDynamicListInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('does not blow up when missing data attributes', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpDynamicListNoDataDom);

		// Create the JS
		cgdpDynamicListInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[1]);

		expect(spy).toHaveBeenCalledWith(
			'LP:Collection:LinkClick',
			'LP:Collection:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Dynamic List',
				componentTheme: '_ERROR_',
				componentVariant: '_ERROR_',
				title: 'Recent Press Releases',
				linkType: 'Internal',
				linkText: 'BRCA Exchange aggregates data on thousands of BRCA',
				linkArea: 'Collection Item',
				totalLinks: 6,
				linkPosition: 2,
			}
		);
	});
});
