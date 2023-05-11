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
	});
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
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
				pageRows: 1,
				pageRowIndex: 1,
				rowItems: 3,
				rowItemIndex: 1,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: 'External Card Title',
				linkType: 'External',
				linkText: 'Undefined',
				linkArea: 'Undefined',
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
				pageRows: 1,
				pageRowIndex: 1,
				rowItems: 3,
				rowItemIndex: 2,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: 'Internal Card Title',
				linkType: 'Internal',
				linkText: 'Undefined',
				linkArea: 'Undefined',
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
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				rowItems: 0,
				rowItemIndex: 0,
				componentType: 'Feature Card',
				componentTheme: 'Light',
				componentVariant: 'Standard Single Link',
				title: '_ERROR_',
				linkType: '_ERROR_',
				linkText: 'Undefined',
				linkArea: 'Undefined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
});
