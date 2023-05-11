import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import * as eddlUtil from '../../../core/analytics/eddl-util';
import { landingClickTracker } from '../landing-page-contents-helper';

jest.mock('../../../core/analytics/eddl-util');

describe('Landing click tracker helper', () => {
	afterEach(() => {
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when row does not exist', () => {
		// Create test html
		const html = `<a href="https://www.google.com" data-eddl-landing-item="test-item></a>`;

		// Inject the HTML into the dom
		document.body.insertAdjacentHTML('beforeend', html);

		// Create spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Create the JS
		landingClickTracker(
			document.body,
			'linkName',
			0,
			0,
			'componentType',
			'componentTheme',
			'componentVariant',
			'title',
			'linkType',
			'linkText',
			'linkArea',
			0,
			0
		);

		// Test spy
		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:linkName:LinkClick',
			'LP:linkName:LinkClick',
			{
				location: 'Body',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				rowItems: 0,
				rowItemIndex: 0,
				componentType: 'componentType',
				componentTheme: 'componentTheme',
				componentVariant: 'componentVariant',
				title: 'title',
				linkType: 'linkType',
				linkText: 'linkText',
				linkArea: 'linkArea',
				totalLinks: 0,
				linkPosition: 0,
			}
		);
	});

	it('finds page row index', () => {
		// Create test html
		const html = `
			<div data-eddl-landing-row></div>
			<div data-eddl-landing-row></div>
			<div data-eddl-landing-row></div>
			<div data-eddl-landing-row></div>
		`;

		// Create new landing row
		const row = document.createElement('div');
		row.setAttribute('data-eddl-landing-row', '');

		// Create new landing item
		const item = document.createElement('a');
		item.setAttribute('data-eddl-landing-item', '');
		row.append(item);

		// Inject the HTML into the dom
		document.body.insertAdjacentHTML('beforeend', html);
		document.body.append(row);

		// Create spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Create the JS
		landingClickTracker(
			item,
			'linkName',
			0,
			0,
			'componentType',
			'componentTheme',
			'componentVariant',
			'title',
			'linkType',
			'linkText',
			'linkArea',
			0,
			0
		);

		// Test spy
		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:linkName:LinkClick',
			'LP:linkName:LinkClick',
			{
				location: 'Body',
				pageRows: 5,
				pageRowIndex: 5,
				rowItems: 0,
				rowItemIndex: 0,
				componentType: 'componentType',
				componentTheme: 'componentTheme',
				componentVariant: 'componentVariant',
				title: 'title',
				linkType: 'linkType',
				linkText: 'linkText',
				linkArea: 'linkArea',
				totalLinks: 0,
				linkPosition: 0,
			}
		);
	});
});
