import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpFeatureCardInit from '../cgdp-feature-cards';
import { nciFeatureCardRowDom } from './nci-feature-card-row.dom';
import { nciFeatureCardRowBadDom } from './nci-feature-card-row.bad.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Feature Cards', () => {
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

	it('does not blow up when cards do not exist', () => {
		const dom = `<section class="usa-section usa-section--light cgdp-feature-card-row" data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		cgdpFeatureCardInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('external feature card', () => {
		const dom = nciFeatureCardRowDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFeatureCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:FeatureCard:LinkClick',
			'LP:FeatureCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 3,
				containerItemIndex: 1,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: 'External Card Title',
				linkType: 'External',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('internal feature card', () => {
		const dom = nciFeatureCardRowDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFeatureCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[1]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:FeatureCard:LinkClick',
			'LP:FeatureCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 3,
				containerItemIndex: 2,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: 'Internal Card Title',
				linkType: 'Internal',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('multimedia feature card', () => {
		const dom = nciFeatureCardRowDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFeatureCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:FeatureCard:LinkClick',
			'LP:FeatureCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 3,
				containerItemIndex: 3,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: 'Media Card Title',
				linkType: 'Media',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('bad DOM feature card', () => {
		const dom = nciFeatureCardRowBadDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFeatureCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:FeatureCard:LinkClick',
			'LP:FeatureCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: '_ERROR_',
				linkType: '_ERROR_',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
});
