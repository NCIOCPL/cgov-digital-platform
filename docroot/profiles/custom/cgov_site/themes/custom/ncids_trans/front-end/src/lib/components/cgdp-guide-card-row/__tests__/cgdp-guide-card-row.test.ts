import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpGuideCardRow from '../cgdp-guide-card-row';
import { cgdpGuideCardRowDom } from './cgdp-guide-card-row.dom';
import { cgdpGuideCardRowBadDom } from './cgdp-guide-card-row.bad.dom';
import { cgdp3GuideCardRowDom } from './cgdp-3-guide-card-row.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Guide Cards', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when cards do not exist', () => {
		const html = `<section data-eddl-landing-row></section>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpGuideCardRow();

		expect(spy).not.toHaveBeenCalled();
	});
	it('does not blow up when row does not exist', () => {
		const html = `<div data-eddl-landing-item="guide_card"><a href="#"></a></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpGuideCardRow();

		expect(spy).not.toHaveBeenCalled();
	});

	it('sends analytics when external link clicked', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[1]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 2,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: 'Researchers',
				linkType: 'External',
				linkText: 'Learn More',
				linkArea: 'Button',
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('sends description with missing heading', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowBadDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[1]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 2,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: 'Support for the best science underpins everything ',
				linkType: 'External',
				linkText: 'Learn More',
				linkArea: 'Button',
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('sends description with null heading', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowBadDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[7]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 1,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: "NCI is the nation's trusted source for cancer info",
				linkType: 'External',
				linkText: 'Learn More',
				linkArea: 'Button',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('sends description with missing header id', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowBadDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[8]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 2,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: 'Support for the best science underpins everything ',
				linkType: 'External',
				linkText: 'Learn More',
				linkArea: 'Button',
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('sends description with missing ul element', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowBadDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[7]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 1,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: "NCI is the nation's trusted source for cancer info",
				linkType: 'External',
				linkText: 'Learn More',
				linkArea: 'Button',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('sends error with missing labelledby and description', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowBadDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 1,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: '_ERROR_',
				linkType: 'External',
				linkText: 'Learn More',
				linkArea: 'Button',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('sends error if missing link content', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpGuideCardRowBadDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[9]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 2,
				containerItemIndex: 2,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Image and Description',
				title: 'Support for the best science underpins everything ',
				linkType: '_ERROR_',
				linkText: '_ERROR_',
				linkArea: 'Button',
				totalLinks: 6,
				linkPosition: 2,
			}
		);
	});

	it('sends analytics when external link clicked on default guide card', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdp3GuideCardRowDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[1]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Standard',
				title: 'Research Grant Funding',
				linkType: 'External',
				linkText: 'Cancer Moonshot Funding Opportunities',
				linkArea: 'Button',
				totalLinks: 4,
				linkPosition: 2,
			}
		);
	});

	it('sends analytics when internal link clicked on default guide card', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdp3GuideCardRowDom);

		// Create the JS
		cgdpGuideCardRow();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[2]);

		expect(spy).toHaveBeenCalledWith(
			'LP:GuideCard:LinkClick',
			'LP:GuideCard:LinkClick',
			{
				location: 'Body',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Guide Card',
				componentTheme: 'Light',
				componentVariant: 'Standard',
				title: 'Research Grant Funding',
				linkType: 'Internal',
				linkText: 'Funding Strategy',
				linkArea: 'Button',
				totalLinks: 4,
				linkPosition: 3,
			}
		);
	});
});
