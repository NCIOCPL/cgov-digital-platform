import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import initialize from '../index';
import { trackOther } from '../../../../../core/analytics/eddl-util';
import {
	cgdpEmbedCard,
	cgdpEmbedCardEmptyTitle,
	cgdpEmbedCardImageless,
	cgdpEmbedCardRight,
	cgdpRecommendedContentCards,
} from './cgdp-embed-card.dom';

jest.mock('../../../../../core/analytics/eddl-util', () => ({
	trackOther: jest.fn(),
}));

describe('Embedded Card Analytics Behavior', () => {
	beforeEach(() => {
		document.body.innerHTML = cgdpEmbedCard;
		jest.clearAllMocks();
	});

	it('should return when there are no embedded cards on the page', () => {
		document.body.innerHTML = '';
		initialize();

		const card = document.querySelector('.cgdp-embed-feature-card');
		expect(card).toBeNull();
	});

	it('should initialize the embedded card and call analytics on click', () => {
		initialize();

		const card = document.querySelector(
			'.cgdp-embed-feature-card'
		) as HTMLElement;
		expect(card).not.toBeNull();

		fireEvent.click(card);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			expect.objectContaining({
				location: 'Body',
				componentType: 'Embedded Card',
				linkType: 'Internal',
				cardType: 'Feature',
				cardTitle: 'Feelings and Cancer',
				linkArea: 'Description', // because click target is not IMG, P, DIV, or SPAN
				cardAlignment: 'None',
			})
		);
	});

	it('should initialize the embedded card and call analytics on click even if the card has no title', () => {
		document.body.innerHTML = cgdpEmbedCardEmptyTitle;
		initialize();

		const card = document.querySelector(
			'.cgdp-embed-feature-card'
		) as HTMLElement;
		expect(card).not.toBeNull();

		fireEvent.click(card);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			expect.objectContaining({
				location: 'Body',
				componentType: 'Embedded Card',
				linkType: 'Internal',
				cardType: 'Feature',
				cardTitle: 'Not Defined',
				linkArea: 'Description', // because click target is not IMG, P, DIV, or SPAN
				cardAlignment: 'None',
			})
		);
	});

	it('should initialize the embedded card and call analytics on click for an aligned card', () => {
		document.body.innerHTML = cgdpEmbedCardRight;
		initialize();

		const card = document.querySelector(
			'.cgdp-embed-feature-card'
		) as HTMLElement;
		expect(card).not.toBeNull();

		fireEvent.click(card);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			expect.objectContaining({
				location: 'Body',
				componentType: 'Embedded Card',
				linkType: 'Internal',
				cardType: 'Feature',
				cardTitle: 'Feelings and Cancer',
				linkArea: 'Description', // because click target is not IMG, P, DIV, or SPAN
				cardAlignment: 'Right',
			})
		);
	});

	it('should initialize the embedded card and call analytics on click for an imageless card', () => {
		document.body.innerHTML = cgdpEmbedCardImageless;
		initialize();

		const card = document.querySelector(
			'.cgdp-embed-feature-card'
		) as HTMLElement;
		expect(card).not.toBeNull();

		fireEvent.click(card);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			expect.objectContaining({
				location: 'Body',
				componentType: 'Embedded Card',
				linkType: 'Internal',
				cardType: 'Imageless',
				cardTitle: 'Feelings and Cancer',
				linkArea: 'Description',
				cardAlignment: 'None',
			})
		);
	});

	it('should track internal recommended content feature card clicks', () => {
		document.body.innerHTML = cgdpRecommendedContentCards;
		initialize();

		const card = document.querySelector(
			'.cgdp-recommended-content [data-eddl-landing-item="feature_card"]'
		) as HTMLElement;
		const title = card.querySelector('.nci-card__title') as HTMLElement;
		fireEvent.click(title);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			{
				location: 'Body',
				componentType: 'Recommended Content',
				linkType: 'Internal',
				cardType: 'Feature',
				cardTitle: 'Internal Recommended Card',
				cardAlignment: 'None',
				linkArea: 'Title',
			}
		);
	});

	it('should identify recommended content image clicks', () => {
		document.body.innerHTML = cgdpRecommendedContentCards;
		initialize();

		const image = document.querySelector(
			'.cgdp-recommended-content [data-eddl-landing-item="feature_card"] img'
		) as HTMLElement;
		fireEvent.click(image);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			expect.objectContaining({
				cardAlignment: 'None',
				linkArea: 'Image',
			})
		);
	});

	it.each([
		['align-left', 'Left'],
		['align-right', 'Right'],
		['align-center', 'Center'],
	])(
		'should return %s recommended content alignment as %s',
		(alignmentClass, expectedAlignment) => {
			document.body.innerHTML = cgdpRecommendedContentCards;
			const recommendedContent = document.querySelector(
				'.cgdp-recommended-content'
			) as HTMLElement;
			recommendedContent.classList.add(alignmentClass);
			initialize();

			const card = document.querySelector(
				'.cgdp-recommended-content [data-eddl-landing-item="feature_card"]'
			) as HTMLElement;
			fireEvent.click(card);

			expect(trackOther).toHaveBeenCalledWith(
				'Body:EmbeddedCard:LinkClick',
				'Body:EmbeddedCard:LinkClick',
				expect.objectContaining({
					cardAlignment: expectedAlignment,
				})
			);
		}
	);

	it('should track external recommended content imageless card clicks', () => {
		document.body.innerHTML = cgdpRecommendedContentCards;
		initialize();

		const card = document.querySelector(
			'.cgdp-recommended-content [data-eddl-landing-item="imageless_card"]'
		) as HTMLElement;
		const description = card.querySelector('.nci-card__body') as HTMLElement;
		fireEvent.click(description);

		expect(trackOther).toHaveBeenCalledWith(
			'Body:EmbeddedCard:LinkClick',
			'Body:EmbeddedCard:LinkClick',
			{
				location: 'Body',
				componentType: 'Recommended Content',
				linkType: 'External',
				cardType: 'Imageless',
				cardTitle: 'External Recommended Card',
				cardAlignment: 'None',
				linkArea: 'Description',
			}
		);
	});

	it('should not attach duplicate recommended content click handlers', () => {
		document.body.innerHTML = cgdpRecommendedContentCards;
		initialize();
		initialize();

		const card = document.querySelector(
			'.cgdp-recommended-content [data-eddl-landing-item="feature_card"]'
		) as HTMLElement;
		fireEvent.click(card);

		expect(trackOther).toHaveBeenCalledTimes(1);
	});
});
