import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import bannerInit from '../usa-banner';

jest.mock('../../../core/analytics/eddl-util');

describe('usa-banner', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends the correct analytics for Spanish toggle', async () => {
		const englishBanner = `
			<section id="usa-banner" class="usa-banner usa-banner--nci-banner" aria-label="Official government website">
				<header class="usa-banner__header">
					<div class="usa-banner__inner">
						<div class="usa-banner__header-text">
							An official website of the United States government
						</div>
									<a href="/espanol/cancer/sobrellevar/sentimientos" class="usa-button usa-button--nci-small" hreflang="es">Español</a>
					</div>
				</header>
			</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', englishBanner);

		// Create the banner JS
		bannerInit();

		const link = await screen.findByRole('link');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: 'English to Spanish',
				location: 'PreHeader',
				action: 'Link Click',
				preHeaderElement: 'Language',
			}
		);
	});

	it('sends the correct analytics for the English toggle', async () => {
		const spanishBanner = `
			<section id="usa-banner" class="usa-banner usa-banner--nci-banner" aria-label="Un sitio oficial del Gobierno de Estados Unidos">
				<header class="usa-banner__header">
					<div class="usa-banner__inner">
						<div class="usa-banner__header-text">
							Un sitio oficial del Gobierno de Estados Unidos
						</div>
									<a href="/about-cancer/coping/feelings" class="usa-button usa-button--nci-small" hreflang="en">English</a>
					</div>
				</header>
			</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', spanishBanner);

		// Create the banner JS
		bannerInit();

		const link = await screen.findByRole('link');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: 'Spanish to English',
				location: 'PreHeader',
				action: 'Link Click',
				preHeaderElement: 'Language',
			}
		);
	});

	it('does not blow up if there is no toggle', async () => {
		const noToggleBanner = `
		<section id="usa-banner" class="usa-banner usa-banner--nci-banner" aria-label="Official government website">
			<header class="usa-banner__header">
				<div class="usa-banner__inner">
					<div class="usa-banner__header-text">
						An official website of the United States government
					</div>

				</div>
			</header>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', noToggleBanner);

		// Create the banner JS
		bannerInit();

		expect(spy).not.toHaveBeenCalled();
	});
});
