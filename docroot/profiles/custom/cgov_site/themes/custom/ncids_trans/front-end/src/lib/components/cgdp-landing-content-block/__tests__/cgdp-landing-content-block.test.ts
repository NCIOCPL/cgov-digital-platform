import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpContentBlock from '../cgdp-landing-content-block';
import { cgdpContentBlockDom } from './cgdp-landing-content-block.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Content Block', () => {
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

	it('sends analytics for internal managed links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const managedLink = screen.getByText('Internal Managed Link');

		// Click the link
		fireEvent.click(managedLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Internal Link Testing',
				linkType: 'Internal',
				linkText: 'Internal Managed Link',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('sends analytics for internal unmanaged links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const unmanagedLink = screen.getByText('Absolute link on same site');

		// Click the link
		fireEvent.click(unmanagedLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Internal Link Testing',
				linkType: 'Internal',
				linkText: 'Absolute link on same site',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 2,
			}
		);
	});

	it('sends analytics for external links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const externalLink = screen.getByText('External Link');

		// Click the link
		fireEvent.click(externalLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'External Link Testing',
				linkType: 'External',
				linkText: 'External Link',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 3,
			}
		);
	});

	it('sends analytics for media managed links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const mediaLink = screen.getByText('Media Link');

		// Click the link
		fireEvent.click(mediaLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Media Link Testing',
				linkType: 'Media',
				linkText: 'Media Link',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 4,
			}
		);
	});

	it('sends analytics for email links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const emailLink = screen.getByText('Email link');

		// Click the link
		fireEvent.click(emailLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Email Link Testing',
				linkType: 'Email',
				linkText: 'Email link',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 5,
			}
		);
	});

	it('sends analytics for other links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const otherLink = screen.getByText('Other link');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Other Link Testing',
				linkType: 'Other',
				linkText: 'Other link',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 6,
			}
		);
	});

	it('sends analytics for links without heading', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const otherLink = screen.getByText('Link without heading');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'External',
				linkText: 'Link without heading',
				linkArea: 'Text',
				totalLinks: 4,
				linkPosition: 1,
			}
		);
	});

	it('sends analytics for links after empty heading', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const otherLink = screen.getByText('Link following empty heading');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'External',
				linkText: 'Link following empty heading',
				linkArea: 'Text',
				totalLinks: 4,
				linkPosition: 2,
			}
		);
	});

	it('sends analytics for links that are siblings to heading', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const otherLink = screen.getByText('Naked Link following heading');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Naked Link Heading',
				linkType: 'External',
				linkText: 'Naked Link following heading',
				linkArea: 'Text',
				totalLinks: 4,
				linkPosition: 3,
			}
		);
	});

	it('sends analytics for empty link', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpContentBlockDom);

		// Create the JS
		cgdpContentBlock();

		// Get links
		const otherLink = screen.getByTestId('empty-link');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:ContentBlock:LinkClick',
			'MLP:ContentBlock:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Content Block',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'External',
				linkText: '_ERROR_',
				linkArea: 'Text',
				totalLinks: 4,
				linkPosition: 4,
			}
		);
	});

	it('does not blow up when content blocks do not exist', () => {
		const html = `<div data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpContentBlock();

		expect(spy).not.toHaveBeenCalled();
	});
});
