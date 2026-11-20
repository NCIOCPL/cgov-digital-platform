import {
	cgdpErrorPageLinkAnalyticsInit,
	cgdpErrorPageSearchAnalyticsInit,
} from '../error-page-analytics';
import * as eddlUtil from '../../../lib/core/analytics/eddl-util';

describe('error page analytics', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it('tracks body link clicks', () => {
		const errorPage = document.createElement('div');
		errorPage.innerHTML = '<a href="/help">Help</a>';
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		cgdpErrorPageLinkAnalyticsInit(errorPage);
		errorPage.querySelector('a')?.dispatchEvent(new MouseEvent('click'));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'ErrorPage:LinkClick',
			'ErrorPage:LinkClick',
			{ location: 'Body', linkText: 'Help' }
		);
	});

	it.each([
		['en', 'cancer'],
		['es', 'cancer en espanol'],
	])('tracks %s search submissions', (language, searchTerm) => {
		const errorPage = document.createElement('div');
		errorPage.innerHTML = `
                        <form id="errorPageSearchForm" data-language="${language}">
                                <input name="swKeyword" value="${searchTerm}">
                        </form>`;
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		cgdpErrorPageSearchAnalyticsInit(
			errorPage.querySelector('form'),
			errorPage.querySelector('input')
		);
		errorPage.querySelector('form')?.dispatchEvent(new Event('submit'));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'ErrorPage:Search',
			'ErrorPage:Search',
			{ location: 'Body', searchTerm }
		);
	});
});
