import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpArticleBodyInit from '../cgdp-article-body';
import {
	cgdpArticleBodyAccordionDom,
	cgdpArticleBodyNoAccordion,
} from './cgdp-article-body.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Article Body', () => {
	beforeEach(() => {
		document.head.insertAdjacentHTML(
			'beforeend',
			`
			<meta name="dcterms.type" content="cgvArticle">
			<meta name="cgdp.template" content="default">
			`
		);
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('should send analytics when the accordion is expanded', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpArticleBodyAccordionDom);

		// Create the JS
		cgdpArticleBodyInit();

		// Get links
		const accordionHeading = screen.getByText('Overwhelmed');

		// Click the link
		fireEvent.click(accordionHeading);

		expect(spy).toHaveBeenCalledWith(
			'Inner:Accordion:ExpandCollapse',
			'Inner:Accordion:ExpandCollapse',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				accordionAction: 'Collapse',
				accordionFirstInteraction: true,
				componentType: 'Body Accordion',
				title: 'Feelings and Cancer',
				linkType: 'accordion',
				accordionLinkText: 'Overwhelmed',
				totalAccordionItems: 5,
				accordionLinkPosition: 1,
			}
		);
	});

	it('should not break when an accordion is not present', async () => {
		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpArticleBodyNoAccordion);

		// Create the JS
		cgdpArticleBodyInit();

		// Get links
		const accordionHeading = screen.getByText('Overwhelmed');

		expect(accordionHeading).toBeInTheDocument();
	});
});
