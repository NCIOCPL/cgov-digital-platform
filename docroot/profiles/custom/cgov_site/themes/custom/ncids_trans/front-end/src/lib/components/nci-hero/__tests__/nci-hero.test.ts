import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import nciHeroInit from '../nci-hero';
import { nciHeroTestDom } from './nci-hero.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCI Hero', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when the hero does not exist', () => {
		const html = `<section data-eddl-landing-row></section>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('does not blow up when there is no button', () => {
		const html = `
		<section data-eddl-landing-row>
			<div class="nci-hero " data-eddl-landing-item="hero">
				<picture class="nci-hero__image">
					<source media="(min-width: 1024px)" srcset="/sites/default/files/widescreen.jpg">
					<source media="(min-width: 880px)" srcset="/sites/default/files/desktop.jpg">
					<source media="(min-width: 640px)" srcset="/sites/default/files/tablet_large.jpg">
					<source media="(min-width: 480px)" srcset="/sites/default/files/tablet.jpg">
					<source media="(min-width: 320px)" srcset="/sites/default/files/mobile_large.jpg">
					<img loading="lazy" src="/sites/default/files/mobile.jpg" width="640" height="640" alt="">
				</picture>
				<div class="nci-hero__cta-container">
					<div class="nci-hero__cta">
						<h2 class="nci-hero__cta-tagline" id="851">NCI Hero Title 1</h2>
					</div>
				</div>
			</div>
		</section>`;
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('does not blow up when it cannot find the title via tagline', () => {
		const html = `
		<section data-eddl-landing-row>
			<div class="nci-hero " data-eddl-landing-item="hero">
				<picture class="nci-hero__image">
					<source media="(min-width: 1024px)" srcset="/sites/default/files/widescreen.jpg">
					<source media="(min-width: 880px)" srcset="/sites/default/files/desktop.jpg">
					<source media="(min-width: 640px)" srcset="/sites/default/files/tablet_large.jpg">
					<source media="(min-width: 480px)" srcset="/sites/default/files/tablet.jpg">
					<source media="(min-width: 320px)" srcset="/sites/default/files/mobile_large.jpg">
					<img loading="lazy" src="/sites/default/files/mobile.jpg" width="640" height="640" alt="">
				</picture>
				<div class="nci-hero__cta-container">
					<div class="nci-hero__cta nci-hero__cta--with-button">
						<h2 id="851">NCI Hero Title 1</h2>
						<a data-testid="herobutton1" href="/about-cancer/coping/feelings" aria-label="Internal Button Alt Text" class="nci-hero__cta-button usa-button" data-eddl-landing-item-link-type="Internal">Feelings and Cancer Link 1</a>
					</div>
				</div>
			</div>
		</section>`;
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 1,
			pageRowIndex: 1,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: 'Button with no CTA Strip',
			title: '_ERROR_',
			linkType: 'Internal',
			linkText: 'Feelings and Cancer Link 1',
			linkArea: 'Primary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});

	it('does not blow up when it cannot find the title via cta div', () => {
		const html = `
		<section data-eddl-landing-row>
			<div class="nci-hero " data-eddl-landing-item="hero">
				<picture class="nci-hero__image">
					<source media="(min-width: 1024px)" srcset="/sites/default/files/widescreen.jpg">
					<source media="(min-width: 880px)" srcset="/sites/default/files/desktop.jpg">
					<source media="(min-width: 640px)" srcset="/sites/default/files/tablet_large.jpg">
					<source media="(min-width: 480px)" srcset="/sites/default/files/tablet.jpg">
					<source media="(min-width: 320px)" srcset="/sites/default/files/mobile_large.jpg">
					<img loading="lazy" src="/sites/default/files/mobile.jpg" width="640" height="640" alt="">
				</picture>
				<div class="nci-hero__cta-container">
					<div>
						<h2 class="nci-hero__cta-tagline" id="851">NCI Hero Title 1</h2>
						<a data-testid="herobutton1" href="/about-cancer/coping/feelings" aria-label="Internal Button Alt Text" class="nci-hero__cta-button usa-button" data-eddl-landing-item-link-type="Internal">Feelings and Cancer Link 1</a>
					</div>
				</div>
			</div>
		</section>`;
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 1,
			pageRowIndex: 1,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: '_ERROR_',
			title: '_ERROR_',
			linkType: 'Internal',
			linkText: 'Feelings and Cancer Link 1',
			linkArea: 'Secondary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});

	it('does not blow up when it cannot find the title via cta container', () => {
		const html = `
		<section data-eddl-landing-row>
			<div class="nci-hero " data-eddl-landing-item="hero">
				<picture class="nci-hero__image">
					<source media="(min-width: 1024px)" srcset="/sites/default/files/widescreen.jpg">
					<source media="(min-width: 880px)" srcset="/sites/default/files/desktop.jpg">
					<source media="(min-width: 640px)" srcset="/sites/default/files/tablet_large.jpg">
					<source media="(min-width: 480px)" srcset="/sites/default/files/tablet.jpg">
					<source media="(min-width: 320px)" srcset="/sites/default/files/mobile_large.jpg">
					<img loading="lazy" src="/sites/default/files/mobile.jpg" width="640" height="640" alt="">
				</picture>
				<div>
					<div class="nci-hero__cta nci-hero__cta--with-button">
						<h2 class="nci-hero__cta-tagline" id="851">NCI Hero Title 1</h2>
						<a data-testid="herobutton1" href="/about-cancer/coping/feelings" aria-label="Internal Button Alt Text" class="nci-hero__cta-button usa-button" data-eddl-landing-item-link-type="Internal">Feelings and Cancer Link 1</a>
					</div>
				</div>
			</div>
		</section>`;
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 1,
			pageRowIndex: 1,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: '_ERROR_',
			title: '_ERROR_',
			linkType: 'Internal',
			linkText: 'Feelings and Cancer Link 1',
			linkArea: 'Primary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});

	it('should pass _ERROR_ for link data when eddl property or text content is missing', () => {
		const html = `
		<section data-eddl-landing-row>
			<div class="nci-hero " data-eddl-landing-item="hero">
				<picture class="nci-hero__image">
					<source media="(min-width: 1024px)" srcset="/sites/default/files/widescreen.jpg">
					<source media="(min-width: 880px)" srcset="/sites/default/files/desktop.jpg">
					<source media="(min-width: 640px)" srcset="/sites/default/files/tablet_large.jpg">
					<source media="(min-width: 480px)" srcset="/sites/default/files/tablet.jpg">
					<source media="(min-width: 320px)" srcset="/sites/default/files/mobile_large.jpg">
					<img loading="lazy" src="/sites/default/files/mobile.jpg" width="640" height="640" alt="">
				</picture>
				<div class="nci-hero__cta-container">
					<div class="nci-hero__cta nci-hero__cta--with-button">
						<h2 class="nci-hero__cta-tagline" id="851">NCI Hero Title 1</h2>
						<a data-testid="herobutton1" href="/about-cancer/coping/feelings" aria-label="Internal Button Alt Text" class="nci-hero__cta-button usa-button"></a>
					</div>
				</div>
			</div>
		</section>`;
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 1,
			pageRowIndex: 1,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: 'Button with no CTA Strip',
			title: 'NCI Hero Title 1',
			linkType: '_ERROR_',
			linkText: '_ERROR_',
			linkArea: 'Primary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});

	it('should pass _ERROR_ for link position when cta strip HTML is bad', () => {
		const html = `
			<section class="usa-section usa-section--light usa-section--cgdp-no-top" aria-labelledby="paragraph-869" data-eddl-landing-row>
				<div class="nci-hero nci-hero--with-cta-strip" data-eddl-landing-item="hero">
					<picture class="nci-hero__image">
						<source media="(min-width: 1024px)" srcset="/sites/default/files/widescreen.jpg">
						<source media="(min-width: 880px)" srcset="/sites/default/files/desktop.jpg">
						<source media="(min-width: 640px)" srcset="/sites/default/files/tablet_large.jpg">
						<source media="(min-width: 480px)" srcset="/sites/default/files/tablet.jpg">
						<source media="(min-width: 320px)" srcset="/sites/default/files/mobile_large.jpg">
						<img loading="lazy" src="/sites/default/files/mobile.jpg" width="640" height="640" alt="">
					</picture>
					<div class="nci-hero__cta-container">
						<div class="nci-hero__cta">
							<h2 class="nci-hero__cta-tagline" id="869">NCI Hero Title 3</h2>
						</div>
					</div>
					<div class="nci-hero__nci-cta-strip-container">
						<div class="grid-container">
							<ul class="nci-cta-strip">
								<a data-testid="justctabutton1" href="https://www.google.com" class="usa-button" data-eddl-landing-item-link-type="External">External Link Button 3</a>
							</ul>
						</div>
					</div>
				</div>
			</section>`;
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('justctabutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 1,
			pageRowIndex: 1,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: 'No Button with CTA Strip',
			title: 'NCI Hero Title 3',
			linkType: 'External',
			linkText: 'External Link Button 3',
			linkArea: 'Secondary Button',
			totalLinks: 1,
			linkPosition: '_ERROR_',
		});
	});

	it('should call the analytics with appropriate values for Button with no CTA Strip', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', nciHeroTestDom);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 5,
			pageRowIndex: 1,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: 'Button with no CTA Strip',
			title: 'NCI Hero Title 1',
			linkType: 'Internal',
			linkText: 'Feelings and Cancer Link 1',
			linkArea: 'Primary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});

	it('should call the analytics with appropriate values for Button with CTA Strip', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', nciHeroTestDom);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('ctabutton1');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 5,
			pageRowIndex: 2,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: 'Button with CTA Strip',
			title: 'NCI Hero Title 2',
			linkType: 'External',
			linkText: 'External Link Button',
			linkArea: 'Secondary Button',
			totalLinks: 4,
			linkPosition: '2-1',
		});
	});

	it('should call the analytics with appropriate values for No Button with CTA Strip', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', nciHeroTestDom);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('justctabutton3');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 5,
			pageRowIndex: 3,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: 'No Button with CTA Strip',
			title: 'NCI Hero Title 3',
			linkType: 'Internal',
			linkText: '[Guide Card] Browser Title 3',
			linkArea: 'Secondary Button',
			totalLinks: 3,
			linkPosition: '2-3',
		});
	});

	it('should call the analytics with an _ERROR_ for componentVariant when necessary classes are missing', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', nciHeroTestDom);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton4');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 5,
			pageRowIndex: 4,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Light',
			componentVariant: '_ERROR_',
			title: 'NCI Hero Title 4',
			linkType: 'Internal',
			linkText: 'Feelings and Cancer Link 4',
			linkArea: 'Primary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});

	it('should call the analytics with appropriate values for Dark Hero with Button with no CTA Strip', () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', nciHeroTestDom);

		// Create the JS
		nciHeroInit();

		// Get links
		const heroLink = screen.getByTestId('herobutton5');

		// Click the link
		fireEvent.click(heroLink);

		expect(spy).toHaveBeenCalledWith('LP:Hero:LinkClick', 'LP:Hero:LinkClick', {
			location: 'Body',
			pageRows: 5,
			pageRowIndex: 5,
			rowItems: 1,
			rowItemIndex: 1,
			componentType: 'Hero',
			componentTheme: 'Dark',
			componentVariant: 'Button with no CTA Strip',
			title: 'NCI Hero Title 5',
			linkType: 'Internal',
			linkText: 'Feelings and Cancer Link 1',
			linkArea: 'Primary Button',
			totalLinks: 1,
			linkPosition: '1-1',
		});
	});
});
