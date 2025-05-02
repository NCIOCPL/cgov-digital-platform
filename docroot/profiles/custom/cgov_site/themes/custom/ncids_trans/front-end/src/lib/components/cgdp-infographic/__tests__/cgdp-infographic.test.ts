import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpInfographicInit from '../cgdp-infographic';
import {
	cgdpInfographicDom,
	cgdpInfographicErrorDom,
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
			'Body:EmbeddedMedia:Infographic:Print',
			'Body:EmbeddedMedia:Infographic:Print',
			{
				location: 'Body',
				componentType: 'Embedded Infographic',
				mediaType: 'Infographic',
				linkText: 'View and Print Infographic',
				linkType: 'viewPrint',
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
});
