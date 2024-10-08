import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpInlineVideoAnalytics from '../cgdp-inline-video-analytics';
import { cgdpInlineVideoDom } from './cgdp-inline-video.dom';
import { cgdpInlineVideoBadDom } from './cgdp-inline-video.bad.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('CGDP Inline Video', () => {
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
		jest.resetAllMocks();
	});
	it('does not blow up when row does not exist', () => {
		const html = `<div data-eddl-landing-item="inline_video"></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpInlineVideoAnalytics();

		expect(spy).not.toHaveBeenCalled();
	});
	it('sends analytics on button click', () => {
		const dom = cgdpInlineVideoDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpInlineVideoAnalytics();

		const button = document.querySelectorAll('.cgdp-video');

		fireEvent.click(button[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:InlineVideo:LinkClick',
			'LP:InlineVideo:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
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
				linkPosition: 'Play',
			}
		);
	});

	it('sends errors if bad dom', () => {
		const dom = cgdpInlineVideoBadDom();

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', dom.outerHTML);

		// Create the JS
		cgdpInlineVideoAnalytics();

		const button = document.querySelectorAll('.video-preview--play-button');

		fireEvent.click(button[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'LP:InlineVideo:LinkClick',
			'LP:InlineVideo:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvHomeLanding',
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
				linkPosition: 'Play',
			}
		);
	});
});
