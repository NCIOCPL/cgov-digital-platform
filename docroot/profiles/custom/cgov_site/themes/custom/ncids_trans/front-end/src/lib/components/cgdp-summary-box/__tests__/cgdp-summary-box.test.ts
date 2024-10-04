import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpSummaryBox from '../cgdp-summary-box';
import { cgdpSummaryBoxDom } from './cgdp-summary-box.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Summary Box', () => {
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const managedLink = screen.getByText('Internal Managed Link');

		// Click the link
		fireEvent.click(managedLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Summary Box Heading',
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const unmanagedLink = screen.getByText('Absolute link on same site');

		// Click the link
		fireEvent.click(unmanagedLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Summary Box Heading',
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const externalLink = screen.getByText('External Link');

		// Click the link
		fireEvent.click(externalLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Summary Box Heading',
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const mediaLink = screen.getByText('Media Link');

		// Click the link
		fireEvent.click(mediaLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Summary Box Heading',
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const emailLink = screen.getByText('Email link');

		// Click the link
		fireEvent.click(emailLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Summary Box Heading',
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const otherLink = screen.getByText('Other link');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Summary Box Heading',
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
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const otherLink = screen.getByText('Link without heading');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
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

	it('sends analytics for empty link', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpSummaryBoxDom);

		// Create the JS
		cgdpSummaryBox();

		// Get links
		const otherLink = screen.getByTestId('empty-link');

		// Click the link
		fireEvent.click(otherLink);

		expect(spy).toHaveBeenCalledWith(
			'MLP:SummaryBox:LinkClick',
			'MLP:SummaryBox:LinkClick',
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
				componentType: 'Summary Box',
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

	it('does not blow up when summary box does not exist', () => {
		const html = `<div data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpSummaryBox();

		expect(spy).not.toHaveBeenCalled();
	});
});
