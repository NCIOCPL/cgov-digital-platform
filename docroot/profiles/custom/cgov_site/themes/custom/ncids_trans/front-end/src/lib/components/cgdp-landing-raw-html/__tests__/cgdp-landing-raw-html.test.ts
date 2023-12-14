import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpRawHtml from '../cgdp-landing-raw-html';
import { cgdpLandingRawHtmlDom } from './cgdp-landing-raw-html.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Raw Html', () => {
	beforeEach(() => {
		window.print = jest.fn();
	});
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
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
				pageRows: 0,
				pageRowIndex: '_ERROR_',
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
				pageRows: 0,
				pageRowIndex: '_ERROR_',
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
				pageRows: 4,
				pageRowIndex: 1,
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
