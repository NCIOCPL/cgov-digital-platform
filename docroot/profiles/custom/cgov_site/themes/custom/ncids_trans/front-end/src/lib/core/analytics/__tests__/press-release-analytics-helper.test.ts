import '@testing-library/jest-dom';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../eddl-util';
import { pressReleaseAnalyticsHelper } from '../press-release-analytics-helper';

jest.mock('../eddl-util');

describe('press-release-analytics-helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends the contact analytics event once per click', () => {
		document.body.innerHTML = `
			<div class="cgdp-media-contact">
				<div class="cgdp-media-contact__info">
					<strong>Contact: </strong>
					<a href="mailto:nihpress@nih.gov"> NIH Press Office </a>
				</div>
			</div>
		`;
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		pressReleaseAnalyticsHelper();
		pressReleaseAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'NIH Press Office' }));

		expect(trackOtherSpy).toHaveBeenCalledTimes(1);
		expect(trackOtherSpy).toHaveBeenCalledWith(
			'PressRelease:Contact:LinkClick',
			'PressRelease:Contact:LinkClick',
			{
				location: 'Body',
				componentType: 'Contact',
				linkText: 'NIH Press Office',
			}
		);
	});

	it('uses the analytics error value when link text is empty', () => {
		document.body.innerHTML = `
			<div class="cgdp-media-contact">
				<div class="cgdp-media-contact__info">
					<a href="mailto:nihpress@nih.gov"></a>
				</div>
			</div>
		`;
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		pressReleaseAnalyticsHelper();
		fireEvent.click(document.querySelector('a') as HTMLAnchorElement);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'PressRelease:Contact:LinkClick',
			'PressRelease:Contact:LinkClick',
			{
				location: 'Body',
				componentType: 'Contact',
				linkText: '_ERROR_',
			}
		);
	});

	it('uses the analytics error value when link text is unavailable', () => {
		document.body.innerHTML = `
			<div class="cgdp-media-contact">
				<div class="cgdp-media-contact__info">
					<a href="mailto:nihpress@nih.gov">NIH Press Office</a>
				</div>
			</div>
		`;
		const link = document.querySelector('a') as HTMLAnchorElement;
		Object.defineProperty(link, 'textContent', { value: null });
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		pressReleaseAnalyticsHelper();
		fireEvent.click(link);

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'PressRelease:Contact:LinkClick',
			'PressRelease:Contact:LinkClick',
			{
				location: 'Body',
				componentType: 'Contact',
				linkText: '_ERROR_',
			}
		);
	});

	it('does nothing when the contact link is not present', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');

		pressReleaseAnalyticsHelper();

		expect(trackOtherSpy).not.toHaveBeenCalled();
	});
});
