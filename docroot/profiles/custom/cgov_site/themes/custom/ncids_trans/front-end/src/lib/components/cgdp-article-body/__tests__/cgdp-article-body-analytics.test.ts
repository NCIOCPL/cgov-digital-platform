import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { screen } from '@testing-library/dom';

import * as analyticsHelper from '../../../core/analytics/inner-page-analytics-tracker';

import cgdpArticleBodyInit from '../cgdp-article-body';
import { cgdpFullHtmlDom } from './cgdp-article-body.dom';

jest.mock('../../../core/analytics/inner-page-analytics-tracker');

describe('NCIDS Article Body', () => {
	afterEach(() => {
		document.getElementsByTagName('Body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('finds body sections and calls helper', async () => {
		const spy = jest.spyOn(analyticsHelper, 'bodyLinkAnalyticsHelper');

		document.body.insertAdjacentHTML('beforeend', cgdpFullHtmlDom);
		cgdpArticleBodyInit();

		const bodyHeader = screen.getByText('Test Links in Body Container');

		expect(bodyHeader).toBeInTheDocument();
		expect(spy).toHaveBeenCalled();
	});
});
