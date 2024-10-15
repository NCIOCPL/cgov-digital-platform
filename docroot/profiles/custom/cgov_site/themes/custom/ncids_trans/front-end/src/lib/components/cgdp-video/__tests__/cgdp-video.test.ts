import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import { cgdpVideoDom } from './cgdp-video.dom';
import { cgdpVideoBadDom } from './cgdp-video.bad.dom';
import initialize from '../cgdp-video';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Video', () => {
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
		jest.resetAllMocks();
	});
	it('does not blow up when row does not exist', () => {
		const html = `<div data-eddl-landing-item="video"></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		initialize();

		expect(spy).not.toHaveBeenCalled();
	});
	it('sends analytics on button click', () => {
		const dom = cgdpVideoDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		initialize();

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:InlineVideo:LinkClick',
			'MLP:InlineVideo:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Inline Video',
				componentTheme: 'Not Defined',
				componentVariant: 'Standard YouTube Video',
				title: 'Hedge Maze',
				linkType: 'Video Player',
				linkText: 'Play',
				linkArea: 'Play',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
	it('sends errors if bad dom', () => {
		const dom = cgdpVideoBadDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		initialize();

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'MLP:InlineVideo:LinkClick',
			'MLP:InlineVideo:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvMiniLanding',
				pageTemplate: 'ncids_without_title',
				pageRowVariant: 'Not Defined',
				pageRows: 1,
				pageRowIndex: 1,
				pageRowCols: 0,
				pageRowColIndex: 0,
				containerItems: 1,
				containerItemIndex: 1,
				componentType: 'Inline Video',
				componentTheme: 'Not Defined',
				componentVariant: 'Standard YouTube Video',
				title: '_ERROR_',
				linkType: 'Video Player',
				linkText: 'Play',
				linkArea: 'Play',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});
});
