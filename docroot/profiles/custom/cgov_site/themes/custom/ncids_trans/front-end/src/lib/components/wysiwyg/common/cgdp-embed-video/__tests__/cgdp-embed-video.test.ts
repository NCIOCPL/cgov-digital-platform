import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/dom';

import * as eddlUtil from '../../../../../core/analytics/eddl-util';

import {
	cgdpEmbedVideoDom,
	cgdpEmbedVideoNoTitleDom,
	cgdpEmbedMultipleVideoDom,
	cgdpEmbedNoFlexVideoDom,
} from './cgdp-embed-video.dom';
import initialize from '../cgdp-embed-video';

jest.mock('../../../../../core/analytics/eddl-util');

describe('CGDP Embed Video', () => {
	beforeEach(() => {
		// No additional setup needed for embed video
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when video element does not exist', () => {
		const html = `<div class="some-other-element"></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		initialize();

		expect(spy).not.toHaveBeenCalled();
	});

	it('sends analytics on link click with video title', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpEmbedVideoDom);

		// Create the JS
		initialize();

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Video',
				mediaType: 'Video',
				mediaTitle: 'Test Video - No Caption',
				linkText: 'Test Video - No Caption',
				linkType: 'play',
			}
		);
	});

	it('sends analytics with fallback title when title element is missing', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpEmbedVideoNoTitleDom);

		// Create the JS
		initialize();

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Video',
				mediaType: 'Video',
				mediaTitle: 'Not Defined',
				linkText: 'Not Defined',
				linkType: 'play',
			}
		);
	});

	it('handles multiple video elements and sends analytics for each', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpEmbedMultipleVideoDom);

		// Create the JS
		initialize();

		const buttons = screen.getAllByRole('button');
		expect(buttons).toHaveLength(2);

		// Click first video button
		fireEvent.click(buttons[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Video',
				mediaType: 'Video',
				mediaTitle: 'Test Video - No Caption',
				linkText: 'Test Video - No Caption',
				linkType: 'play',
			}
		);

		// Click second video button
		fireEvent.click(buttons[1]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Video',
				mediaType: 'Video',
				mediaTitle: 'Test Video - No Caption & Audio Described Link',
				linkText: 'Test Video - No Caption & Audio Described Link',
				linkType: 'play',
			}
		);
		expect(trackOtherSpy).toHaveBeenCalledTimes(2);
	});

	it('does not blow up when video element has no flex-video child', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpEmbedNoFlexVideoDom);

		// Create the JS - should not throw an error
		expect(() => initialize()).not.toThrow();

		// No analytics should be tracked since no clickable element exists
		expect(trackOtherSpy).not.toHaveBeenCalled();
	});

	it('tests the null check condition (Note: querySelectorAll never returns null)', () => {
		// This test demonstrates that querySelectorAll never returns null
		// It always returns a NodeList, even if empty
		const html = `<div><p>this is a test</p></div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		initialize();

		// Verify no analytics were tracked since no .cgdp-video elements exist
		expect(trackOtherSpy).not.toHaveBeenCalled();
	});
});
