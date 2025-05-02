import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpInfographicInit from '../cgdp-infographic';
import {
	cgdpInfographicDom,
	cgdpInfographicErrorDom,
	cgdpInfographicTest1Dom,
	cgdpInfographicTest2Dom,
	cgdpInfographicTest3Dom,
	cgdpInfographicError1Dom,
	cgdpInfographicError2Dom,
} from './cgdp-infographic.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Infograpihc', () => {
	beforeEach(() => {
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvInfographic">
			`
		);
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends analytics for infographic link', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicDom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: '_ERROR_',
			}
		);
	});

	it('does not send analytics if no link', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicErrorDom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).not.toHaveBeenCalled();
	});

	it('sends analytics when heading in the same wysiwyg block', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicTest1Dom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: 'Section 2 Heading',
			}
		);
	});

	it('sends analytics when heading is in above wysiwyg block', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicTest2Dom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: 'Section 1 Heading',
			}
		);
	});

	it('sends analytics when no headings in wysiwyg blocks', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicTest3Dom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: 'Embedded Infographic Test Page',
			}
		);
	});

	it('sends analytics heading is null', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicError1Dom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: '_ERROR_',
			}
		);
	});

	it('sends analytics when heading is after infographic', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpInfographicError2Dom);

		// Create the JS
		cgdpInfographicInit();

		// Get links
		const links = screen.getAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'Body:EmbeddedMedia:LinkClick',
			'Body:EmbeddedMedia:LinkClick',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
				parentHeading: '_ERROR_',
			}
		);
	});
});
