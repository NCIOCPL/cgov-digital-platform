import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpImagelessCardInit from '../cgdp-imageless-card-group';
import { cgdpImagelessCardRowDom } from './cgdp-imageless-card-group.dom';
import { cgdpImagelessCardRowBadDom } from './cgdp-imageless-card-group.bad.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Imageless Cards', () => {
	beforeEach(() => {
		window.print = jest.fn();
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

	it('does not blow up when cards do not exist', () => {
		const dom = `<section class="usa-section usa-section--light cgdp-imageless-card-group" data-eddl-landing-row></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom);

		// Create the JS
		cgdpImagelessCardInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('external imageless card', () => {
		const dom = cgdpImagelessCardRowDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpImagelessCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:ImagelessCard:LinkClick',
			'MLP:ImagelessCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 3,
				containerItemIndex: 1,
				componentType: 'Imageless Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'The Optional Imageless Card Group Heading - two Ca',
				linkType: 'External',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('internal imageless card', () => {
		const dom = cgdpImagelessCardRowDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpImagelessCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[1]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:ImagelessCard:LinkClick',
			'MLP:ImagelessCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 3,
				containerItemIndex: 2,
				componentType: 'Imageless Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'The Optional Imageless Card Group Heading - two Ca',
				linkType: 'Internal',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('multimedia imageless card', () => {
		const dom = cgdpImagelessCardRowDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpImagelessCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:ImagelessCard:LinkClick',
			'MLP:ImagelessCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 3,
				containerItemIndex: 3,
				componentType: 'Imageless Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'The Optional Imageless Card Group Heading - two Ca',
				linkType: 'Media',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('bad DOM imageless card', () => {
		const dom = cgdpImagelessCardRowBadDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpImagelessCardInit();

		const card = screen.getAllByRole('link');

		fireEvent.click(card[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:ImagelessCard:LinkClick',
			'MLP:ImagelessCard:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_default',
				pageRowVariant: 'Not Defined',
				pageRows: 0,
				pageRowIndex: '_ERROR_',
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 0,
				containerItemIndex: 0,
				componentType: 'Imageless Card',
				componentTheme: 'Not Defined',
				componentVariant: 'Not Defined',
				title: 'Not Defined',
				linkType: '_ERROR_',
				linkText: 'Not Defined',
				linkArea: 'Not Defined',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
});
