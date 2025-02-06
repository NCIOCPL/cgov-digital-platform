import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpFlagCardInit from '../cgdp-flag-card-group';
import { cgdpFlagCardGroupDom } from './cgdp-flag-card-group.dom';
import { cgdpFlagCardGroupBadDom } from './cgdp-flag-card-group.bad.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Flag Cards', () => {
	beforeEach(() => {
		window.print = jest.fn();
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvMiniLanding">
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
		const dom = `<section class="usa-section" data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		cgdpFlagCardInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('internal feature card', () => {
		const dom = cgdpFlagCardGroupDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFlagCardInit();

		const card = screen.getAllByRole('link');
		const titleElement = card[0].querySelector('span') as HTMLElement;

		fireEvent.click(titleElement);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:FlagCard:LinkClick',
			'MLP:FlagCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowVariant: 'Not Defined',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 5,
				containerItemIndex: 1,
				componentType: 'Flag Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'The Optional Flag Card Group Heading',
				linkType: 'Internal',
				linkText: 'About Cancer',
				linkArea: 'Title',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('external feature card', () => {
		const dom = cgdpFlagCardGroupDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFlagCardInit();

		const card = screen.getAllByRole('link');
		const descriptionElement = card[1].querySelector('p') as HTMLElement;

		fireEvent.click(descriptionElement);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:FlagCard:LinkClick',
			'MLP:FlagCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowVariant: 'Not Defined',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 5,
				containerItemIndex: 2,
				componentType: 'Flag Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'The Optional Flag Card Group Heading',
				linkType: 'External',
				linkText: 'External Card Title',
				linkArea: 'Description',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('multimedia feature card', () => {
		const dom = cgdpFlagCardGroupDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFlagCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:FlagCard:LinkClick',
			'MLP:FlagCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 2,
				pageRowIndex: 1,
				pageRowVariant: 'Not Defined',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 5,
				containerItemIndex: 3,
				componentType: 'Flag Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'The Optional Flag Card Group Heading',
				linkType: 'Media',
				linkText: 'Media Card Title',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('bad DOM flag card', () => {
		const dom = cgdpFlagCardGroupBadDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFlagCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:FlagCard:LinkClick',
			'MLP:FlagCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowVariant: 'Not Defined',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
				componentType: 'Flag Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: '_ERROR_',
				linkText: '_ERROR_',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('optional heading on flag card group', () => {
		const dom = cgdpFlagCardGroupDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpFlagCardInit();

		const card = screen.getAllByRole('link');
		const linkElement = card[6].querySelector('img') as HTMLElement;

		fireEvent.click(linkElement);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:FlagCard:LinkClick',
			'MLP:FlagCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRows: 2,
				pageRowIndex: 2,
				pageRowVariant: 'Not Defined',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 5,
				containerItemIndex: 2,
				componentType: 'Flag Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: 'External',
				linkText: 'External Card Title',
				linkArea: 'Image',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
});
