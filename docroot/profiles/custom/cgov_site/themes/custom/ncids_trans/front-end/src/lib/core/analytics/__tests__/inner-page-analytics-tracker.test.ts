import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';
import {
	cgdpFullHtmlDom,
	emptySectionDom,
	introBodyDom,
} from './cgdp-ncids-full-html.dom';
import { bodyLinkAnalyticsHelper } from '../../../core/analytics/inner-page-analytics-tracker';

jest.mock('../../../core/analytics/eddl-util');

describe('Landing click tracker helper', () => {
	afterEach(() => {
		document.getElementsByTagName('Body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when sections have no links', async () => {
		document.body.insertAdjacentHTML('beforeend', emptySectionDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();
		bodyLinkAnalyticsHelper(articleBody, 0);
	});

	it('tracks first link - other', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Other',
				linkText: '1–800–555–1212',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});

	it('tracks second link - email', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[1]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Email',
				linkText: 'test@example.org',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 2,
			}
		);
	});

	it('tracks third link - exernal', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'External',
				linkText: 'http://www.google.com',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 3,
			}
		);
	});

	it('tracks fourth link - internal', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[3]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Internal',
				linkText: 'content link',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 4,
			}
		);
	});

	it('tracks fifth link - media', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[4]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Media',
				linkText: 'media link',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 5,
			}
		);
	});

	it('tracks sixth link - no text error', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[5]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Internal',
				linkText: '_ERROR_',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 6,
			}
		);
	});

	it('does not track embed-button', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);

		const articleBody = document.querySelector(
			'.cgdp-article-body__section'
		) as HTMLElement;
		expect(articleBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(articleBody, 0);
		fireEvent.click(bodyLinks[6]);

		expect(trackOtherSpy).not.toHaveBeenCalled();
	});

	it('tracks intro text first link - other', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', introBodyDom);

		const introTextBody = document.querySelector(
			'.cgdp-field-intro-text'
		) as HTMLElement;
		expect(introTextBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(introTextBody, 0, '.usa-prose');
		fireEvent.click(bodyLinks[1]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Other',
				linkText: '1–800–555–1212',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 2,
			}
		);
	});

	it('tracks intro text second link - email', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', introBodyDom);

		const introTextBody = document.querySelector(
			'.cgdp-field-intro-text'
		) as HTMLElement;
		expect(introTextBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(introTextBody, 0, '.usa-prose');
		fireEvent.click(bodyLinks[2]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Email',
				linkText: 'test@example.org',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 3,
			}
		);
	});

	it('tracks intro text third link - exernal', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', introBodyDom);

		const introTextBody = document.querySelector(
			'.cgdp-field-intro-text'
		) as HTMLElement;
		expect(introTextBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(introTextBody, 0, '.usa-prose');
		fireEvent.click(bodyLinks[3]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'External',
				linkText: 'http://www.google.com',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 4,
			}
		);
	});

	it('tracks intro text fourth link - internal', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', introBodyDom);

		const introTextBody = document.querySelector(
			'.cgdp-field-intro-text'
		) as HTMLElement;
		expect(introTextBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(introTextBody, 0, '.usa-prose');
		fireEvent.click(bodyLinks[4]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Internal',
				linkText: 'content link',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 5,
			}
		);
	});

	it('tracks intro text fifth link - media', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', introBodyDom);

		const introTextBody = document.querySelector(
			'.cgdp-field-intro-text'
		) as HTMLElement;
		expect(introTextBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(introTextBody, 0, '.usa-prose');
		fireEvent.click(bodyLinks[5]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Media',
				linkText: 'media link',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 6,
			}
		);
	});

	it('tracks clicked definition links', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', introBodyDom);

		const introTextBody = document.querySelector(
			'.cgdp-field-intro-text'
		) as HTMLElement;
		expect(introTextBody).toBeInTheDocument();

		const bodyLinks: HTMLCollectionOf<HTMLAnchorElement> =
			document.getElementsByTagName('a');

		bodyLinkAnalyticsHelper(introTextBody, 0, '.usa-prose');
		fireEvent.click(bodyLinks[0]);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Inner:WYSIWYG:LinkClick',
			'Inner:WYSIWYG:LinkClick',
			{
				location: 'Body',
				componentType: 'WYSIWYG',
				linkType: 'Glossified',
				linkText: 'chest x-rays',
				sectionIndex: 1,
				totalLinks: 6,
				linkPosition: 1,
			}
		);
	});
});
