import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpArticleFooterCitationInit from '../cgdp-article-footer-citation';
import {
	cgdpArticleFooterCitationDom,
	cgdpArticleFooterCitationNoAccordion,
} from './cgdp-article-footer-citation.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Article Footer Citation', () => {
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
		document.body.insertAdjacentHTML('beforeend', cgdpArticleFooterCitationDom);

		// Create the JS
		cgdpArticleFooterCitationInit();

		// Get links
		const accordionHeading = screen.getByText('References');

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
				componentType: 'Citation Accordion',
				title: 'Feelings and Cancer',
				linkType: 'accordion',
				accordionLinkText: 'References',
				totalAccordionItems: 1,
				accordionLinkPosition: 1,
			}
		);
	});

	it('should not break when an accordion is not present', async () => {
		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpArticleFooterCitationNoAccordion
		);

		// Create the JS
		cgdpArticleFooterCitationInit();

		// Get links
		const accordionHeading = screen.getByText('References');

		expect(accordionHeading).toBeInTheDocument();
	});
});
