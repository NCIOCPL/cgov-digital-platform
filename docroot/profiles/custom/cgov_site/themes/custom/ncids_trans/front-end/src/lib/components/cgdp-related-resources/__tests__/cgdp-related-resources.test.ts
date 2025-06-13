import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpRelatedResourcesInit from '../cgdp-related-resources';
import {
	cgdpRelatedResourcesDom,
	cgdpRelatedResourceErrorDom,
	cgdpRelatedResourcesAccordionDom,
	cgdpRelatedResourcesBadAccordionDom,
} from './cgdp-related-resources.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Related Resources', () => {
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

	it('sends analytics for internal managed links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpRelatedResourcesDom);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const managedLink = screen.getByText('Overridden Title');

		// Click the link
		fireEvent.click(managedLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:RelatedResources:LinkClick',
			'Inner:RelatedResources:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'Related Resources',
				title: 'Related Resources',
				linkType: 'Internal',
				linkText: 'Overridden Title',
				totalLinks: 4,
				linkPosition: 2,
			}
		);
	});

	it('sends analytics for external managed links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpRelatedResourcesDom);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const managedLink = screen.getByText('External Card Title');

		// Click the link
		fireEvent.click(managedLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:RelatedResources:LinkClick',
			'Inner:RelatedResources:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'Related Resources',
				title: 'Related Resources',
				linkType: 'External',
				linkText: 'External Card Title',
				totalLinks: 4,
				linkPosition: 3,
			}
		);
	});

	it('sends analytics for media managed links', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpRelatedResourcesDom);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const managedLink = screen.getByText('Test PDF File name');

		// Click the link
		fireEvent.click(managedLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:RelatedResources:LinkClick',
			'Inner:RelatedResources:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'Related Resources',
				title: 'Related Resources',
				linkType: 'Media',
				linkText: 'Test PDF File name',
				totalLinks: 4,
				linkPosition: 4,
			}
		);
	});

	it('handles bad links and missing titles', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpRelatedResourceErrorDom);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const managedLink = screen.getByText('Bad Link');

		// Click the link
		fireEvent.click(managedLink);

		expect(spy).toHaveBeenCalledWith(
			'Inner:RelatedResources:LinkClick',
			'Inner:RelatedResources:LinkClick',
			{
				location: 'Body',
				pageType: 'cgvArticle',
				pageTemplate: 'default',
				componentType: 'Related Resources',
				title: 'Not Defined',
				linkType: '_ERROR_',
				linkText: 'Bad Link',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('does not fail when there is no list', async () => {
		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', '<h1>Hello World</h1>');

		// Create the JS
		cgdpRelatedResourcesInit();

		expect(screen.getByText('Hello World')).toBeInTheDocument();
	});

	it('should send analytics when the accordion is expanded', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpRelatedResourcesAccordionDom
		);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const accordionHeading = screen.getByText('Related Resources');

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
				componentType: 'Related Resources Accordion',
				title: '_ERROR_',
				linkType: 'accordion',
				accordionLinkText: 'Related Resources',
				totalAccordionItems: 1,
				accordionLinkPosition: 1,
			}
		);
	});

	it('should send analytics when the accordion is expanded even if the heading has no text', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpRelatedResourcesBadAccordionDom
		);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const accordionHeading = screen.getByTestId('accordion-heading');

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
				componentType: 'Related Resources Accordion',
				title: '_ERROR_',
				linkType: 'accordion',
				accordionLinkText: '_ERROR_',
				totalAccordionItems: 1,
				accordionLinkPosition: 1,
			}
		);
	});

	it('should not break when an accordion is not present', async () => {
		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpRelatedResourcesAccordionDom
		);

		// Create the JS
		cgdpRelatedResourcesInit();

		// Get links
		const accordionHeading = screen.getByText('Related Resources');

		expect(accordionHeading).toBeInTheDocument();
	});
});
