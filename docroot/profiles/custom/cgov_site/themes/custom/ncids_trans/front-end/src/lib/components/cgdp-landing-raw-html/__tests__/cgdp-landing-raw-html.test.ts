import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpRawHtml from '../cgdp-landing-raw-html';
import { cgdpLandingRawHtmlDom } from './cgdp-landing-raw-html.dom';
import { cgdpRawHTMLRowCols } from './cgdp-landing-raw-html-cols.dom';
import { cgdpLandingRawHtmlSingleBlockDom } from './cgdp-landing-raw-html-single-block.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Raw Html', () => {
	beforeEach(() => {
		window.print = jest.fn();
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvHomeLanding">
			<meta name="cgdp.template" content="ncids_without_title">
			`
		);
	});
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when raw html links do not exist', () => {
		const dom = `<section class="usa-section usa-section--light" data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		cgdpRawHtml();

		expect(spy).not.toHaveBeenCalled();
	});

	it('does not blow up when row cannot be found', () => {
		const dom = `<a href="#" data-eddl-landing-rawhtml></a>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:RawHTML:LinkClick',
			'LP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'Not Defined',
				linkText: '_ERROR_',
				linkArea: 'Raw HTML',
				totalLinks: 0,
				linkPosition: 0,
			}
		);
	});

	it('protected attributes cannot be overridden', () => {
		const dom = `
			<a
				href="#"
				data-eddl-landing-rawhtml
				data-eddl-landing-rawhtml-location="bad location"
				data-eddl-landing-rawhtml-component-type="bad componentType"
				data-eddl-landing-rawhtml-page-rows="bad pageRows"
				data-eddl-landing-rawhtml-page-row-index="bad pageRowIndex"
				></a>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:RawHTML:LinkClick',
			'LP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'Not Defined',
				linkText: '_ERROR_',
				linkArea: 'Raw HTML',
				totalLinks: 0,
				linkPosition: 0,
			}
		);
	});

	it('raw html link click', () => {
		const dom = cgdpLandingRawHtmlDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:RawHTML:LinkClick',
			'LP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 4,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'I am a header in a prose block',
				linkType: 'Internal',
				linkText: 'Go to some website for more information',
				linkArea: 'Prose Block',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('raw html link click when in row col - col 2', () => {
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpRawHTMLRowCols);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(spy).toHaveBeenCalledWith(
			'LP:RawHTML:LinkClick',
			'LP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 2,
				containerItems: 3,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'NewsEventsRightRail',
				title: 'Media Resources',
				linkType: 'Internal',
				linkText: 'Resources & Contacts',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('raw html link click when in row col - col 1', () => {
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpRawHTMLRowCols);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(spy).toHaveBeenCalledWith(
			'LP:RawHTML:LinkClick',
			'LP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 2,
				pageRowColIndex: 1,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'NewsEventsRightRail',
				title: 'Cancer Currents Blog',
				linkType: 'Internal',
				linkText: 'View all posts',
				linkArea: 'Text',
				totalLinks: 2,
				linkPosition: 1,
			}
		);
	});

	it('sends correct analytics when raw HTML block is the only component on the page', () => {
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpLandingRawHtmlSingleBlockDom
		);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[1]);

		expect(spy).toHaveBeenCalledWith(
			'LP:RawHTML:LinkClick',
			'LP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'NewsEventsRightRail',
				title: 'Media Resources',
				linkType: 'External',
				linkText: 'Images and B-roll',
				linkArea: 'Text',
				totalLinks: 6,
				linkPosition: 2,
			}
		);
	});

	it('actually uses page and template info', () => {
		const dom = cgdpLandingRawHtmlDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);
		document.head.innerHTML = '';
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvMiniLanding">
			<meta name="cgdp.template" content="ncids_default">
			`
		);

		// Create the JS
		cgdpRawHtml();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:RawHTML:LinkClick',
			'MLP:RawHTML:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 4,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Raw HTML',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'I am a header in a prose block',
				linkType: 'Internal',
				linkText: 'Go to some website for more information',
				linkArea: 'Prose Block',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
});
