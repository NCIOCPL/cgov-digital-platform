import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';
import nciCtaStrip from '../nci-cta-strip';
import { nciCtaStripDom } from './nci-cta-strip.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCI CTA Strip', () => {
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

	it('does not blow up if cta does not exist', () => {
		const dom = `<section class="usa-section usa-section--light" data-eddl-landing-row></section>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		nciCtaStrip();

		expect(spy).not.toHaveBeenCalled();
	});

	it('sends error with bad html', () => {
		const html = `<div data-eddl-landing-item="cta_strip"><a href="#"></a></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciCtaStrip();

		const link = screen.getByRole('link');

		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'LP:CTAStrip:LinkClick',
			'LP:CTAStrip:LinkClick',
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
				componentType: 'CTA Strip',
				componentTheme: 'Dark',
				componentVariant: 'Standard',
				title: 'Call to Action Strip',
				linkType: '_ERROR_',
				linkText: '_ERROR_',
				linkArea: 'Button',
				totalLinks: 0,
				linkPosition: 0,
			}
		);
	});

	it('link click sends correct analytics', () => {
		const dom = nciCtaStripDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		nciCtaStrip();

		const link = screen.getAllByRole('link');

		fireEvent.click(link[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:CTAStrip:LinkClick',
			'LP:CTAStrip:LinkClick',
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
				componentType: 'CTA Strip',
				componentTheme: 'Dark',
				componentVariant: 'Standard',
				title: 'Call to Action Strip',
				linkType: 'External',
				linkText: 'Button 1',
				linkArea: 'Button',
				totalLinks: 3,
				linkPosition: 1,
			}
		);
	});

	it('link click sends error if bad html', () => {
		const dom = nciCtaStripDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		nciCtaStrip();

		const link = screen.getAllByRole('link');

		fireEvent.click(link[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:CTAStrip:LinkClick',
			'LP:CTAStrip:LinkClick',
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
				componentType: 'CTA Strip',
				componentTheme: 'Dark',
				componentVariant: 'Standard',
				title: 'Call to Action Strip',
				linkType: '_ERROR_',
				linkText: '_ERROR_',
				linkArea: 'Button',
				totalLinks: 3,
				linkPosition: 3,
			}
		);
	});
});
