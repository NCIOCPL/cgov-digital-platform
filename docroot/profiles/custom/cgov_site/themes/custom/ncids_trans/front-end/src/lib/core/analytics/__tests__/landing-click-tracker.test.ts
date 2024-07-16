import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import * as eddlUtil from '../../../core/analytics/eddl-util';
import {
	getContainerItemInfo,
	landingClickTracker,
} from '../landing-page-contents-helper';

jest.mock('../../../core/analytics/eddl-util');

describe('Landing click tracker helper', () => {
	afterEach(() => {
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when row does not exist', () => {
		// Create test html
		const html = `<a href="https://www.google.com" data-eddl-landing-item="test-item></a>`;

		// Inject the HTML into the dom
		document.body.insertAdjacentHTML('beforeend', html);
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvHomeLanding">
			<meta name="cgdp.template" content="ncids_without_title">
			`
		);

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
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
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

	it('gets the right page type and template', () => {
		// Create test html
		const html = `<a href="https://www.google.com" data-eddl-landing-item="test-item></a>`;

		// Inject the HTML into the dom
		document.body.insertAdjacentHTML('beforeend', html);
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvMiniLanding">
			<meta name="cgdp.template" content="ncids_default">
			`
		);

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
			'MLP:linkName:LinkClick',
			'MLP:linkName:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
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

	it('sets event to start with unknown if type is not know', () => {
		// Create test html
		const html = `<a href="https://www.google.com" data-eddl-landing-item="test-item></a>`;

		// Inject the HTML into the dom
		document.body.insertAdjacentHTML('beforeend', html);
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="chicken">
			<meta name="cgdp.template" content="chicken">
			`
		);

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
			'UNKNOWN:linkName:LinkClick',
			'UNKNOWN:linkName:LinkClick',
			{
				location: 'Body',
				pageType: 'chicken',
				pageTemplate: 'chicken',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
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

	it('sets event to start with unknown if no type', () => {
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
			'UNKNOWN:linkName:LinkClick',
			'UNKNOWN:linkName:LinkClick',
			{
				location: 'Body',
				pageType: undefined,
				pageTemplate: undefined,
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
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
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvHomeLanding">
			<meta name="cgdp.template" content="ncids_without_title">
			`
		);

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
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 5,
				pageRowIndex: 5,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
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

	it('sends _ERROR_ if there are columns within the row, but none that are closest to target', () => {
		// Create new landing row
		const row = document.createElement('div');
		row.setAttribute('data-eddl-landing-row', '');

		const rowCol = document.createElement('div');
		rowCol.setAttribute('data-eddl-landing-row-col', '');

		// Create new landing item
		const item = document.createElement('a');
		item.setAttribute('data-eddl-landing-item', '');
		row.append(item);
		row.append(rowCol);

		// Add the mock HTMLElement to the DOM
		document.body.appendChild(row);
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvHomeLanding">
			<meta name="cgdp.template" content="ncids_without_title">
			`
		);

		// Create spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Create the JS
		landingClickTracker(
			item,
			'linkName',
			1,
			1,
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
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 1,
				pageRowColIndex: '_ERROR_',
				containerItems: 1,
				containerItemIndex: 1,
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

	it('sends _ERROR_ if there is no wrapping row on the column', () => {
		// Create new landing row
		const rowCol = document.createElement('div');
		rowCol.setAttribute('data-eddl-landing-row-col', '');

		// Create new landing item
		const item = document.createElement('a');
		item.setAttribute('data-eddl-landing-item', '');
		rowCol.append(item);
		// Add the mock HTMLElement to the DOM
		document.body.appendChild(rowCol);
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvHomeLanding">
			<meta name="cgdp.template" content="ncids_without_title">
			`
		);

		// Create spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Call the getContainerItemInfo function with the mock HTMLElement
		const { containerItems, containerItemIndex } = getContainerItemInfo(item);

		// Assert that the returned object contains the expected values, including containerItemIndex being equal to '_ERROR_'
		// Create the JS
		landingClickTracker(
			item,
			'linkName',
			containerItems,
			containerItemIndex,
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
				pageType: 'cgvHomeLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: '_ERROR_',
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
