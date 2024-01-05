import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import promoblockInit from '../nci-promo-block';
import { test } from './nci-promo-block.dom';

jest.mock('../../../core/analytics/eddl-util');

const numberOfPromoBlockRows = 9;

describe('cgdp-promo-block', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	describe('"PromoBlock Button Click"', () => {
		it('should not die when there is no promoblock', async () => {
			const dom =
				'<div class="main-content type node--type-cgov-home-landing" id="main-content"></div>';
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', dom);

			// Create the PromoBlock JS
			promoblockInit();

			expect(spy).not.toHaveBeenCalled();
		});
		it('should not die when there is no promoblock link', async () => {
			const dom = `
				<div class="nci-promo-block nci-promo-block--dark" data-eddl-landing-item="promo_block">
					<div class="nci-promo-block__content">
						<h2 id="paragraph-1395" class="nci-promo-block__heading">[External Dark Promo Block No Image] Title</h2>
						<p class="nci-promo-block__text">NCI's research strategy supports investigator-initiated research and maximizes opportunities in emerging areas of science. The FY 2024 Annual Plan &amp; Budget Proposal aligns with NCI's vision and supports cancer research.</p>
					</div>
				</div>`;
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', dom);

			// Create the PromoBlock JS
			promoblockInit();

			expect(spy).not.toHaveBeenCalled();
		});
		it('should pass _ERROR_ to analytics title field when there is an empty title', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', test);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByText(
				'PromoBlock Learn More Empty Title',
				{
					selector: 'a',
				}
			);

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: numberOfPromoBlockRows,
					pageRowIndex: 7,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Dark',
					componentVariant: 'Image Right',
					title: '_ERROR_',
					linkType: 'External',
					linkText: 'PromoBlock Learn More Empty Title',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
		it('should pass _ERROR_ to analytics title field when there is no title element', async () => {
			const dom = `
				<div class="main-content type node--type-cgov-home-landing" id="main-content">
					<section class="usa-section" data-eddl-landing-row>
						<div class="nci-promo-block" aria-labelledby="paragraph-1395" data-eddl-landing-item="promo_block">
							<a class="usa-button usa-button--secondary" href="/test/internal-promo-block-test-article" aria-label="Button Alt Text" data-eddl-landing-item-link-type="External">
								PromoBlock Learn More No Title
							</a>
						</div>
					</section>
				</div>`;
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', dom);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByText('PromoBlock Learn More No Title', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: 1,
					pageRowIndex: 1,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Light',
					componentVariant: 'No Image',
					title: '_ERROR_',
					linkType: 'External',
					linkText: 'PromoBlock Learn More No Title',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
		it('should pass _ERROR_ to analytics fields when link is missing data attribute', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', test);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByTestId(
				'promoblock-bad-html-link-no-data'
			);

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: numberOfPromoBlockRows,
					pageRowIndex: 8,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Dark',
					componentVariant: 'Image Left',
					title: 'Bad HTML Title',
					linkType: '_ERROR_',
					linkText: 'Bad HTML Link Text',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
		it('should pass _ERROR_ to analytics fields when link is missing link text', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', test);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByTestId(
				'promoblock-bad-html-link-no-text'
			);

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: numberOfPromoBlockRows,
					pageRowIndex: 9,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Dark',
					componentVariant: 'Image Left',
					title: 'Bad HTML Title',
					linkType: 'External',
					linkText: '_ERROR_',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
		it('promoblock no image dark external', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', test);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByText('PromoBlock Learn More 6', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: numberOfPromoBlockRows,
					pageRowIndex: 6,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Dark',
					componentVariant: 'No Image',
					title: '[External Dark Promo Block No Image] Title',
					linkType: 'External',
					linkText: 'PromoBlock Learn More 6',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
		it('promoblock left image light internal', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', test);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByText('PromoBlock Learn More 1', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: numberOfPromoBlockRows,
					pageRowIndex: 1,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Light',
					componentVariant: 'Image Left',
					title: '[Internal Promo Block Left Image] Title',
					linkType: 'Internal',
					linkText: 'PromoBlock Learn More 1',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
		it('promoblock right image light external', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', test);

			// Create the PromoBlock JS
			promoblockInit();

			const link = await screen.findByText('PromoBlock Learn More 2', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'LP:PromoBlock:LinkClick',
				'LP:PromoBlock:LinkClick',
				{
					location: 'Body',
					pageRows: numberOfPromoBlockRows,
					pageRowIndex: 2,
					pageRowCols: 0,
					pageRowColIndex: 0,
					containerItems: 1,
					containerItemIndex: 1,
					componentType: 'Promo Block',
					componentTheme: 'Light',
					componentVariant: 'Image Right',
					title: '[External Promo Block Right Image] Title',
					linkType: 'External',
					linkText: 'PromoBlock Learn More 2',
					linkArea: 'Button',
					totalLinks: 1,
					linkPosition: 1,
				}
			);
		});
	});
});
