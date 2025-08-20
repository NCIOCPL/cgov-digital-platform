import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import initialize from '../index';
import { trackOther } from '../../../../../core/analytics/eddl-util';
import {
	cgdpEmbedCard,
	cgdpEmbedCardEmptyTitle,
	cgdpEmbedCardImageless,
	cgdpEmbedCardRight,
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

		const card = document.querySelector('.cgdp-embed-card');
		expect(card).toBeNull();
	});

	it('should initialize the embedded card and call analytics on click', () => {
		initialize();

		const card = document.querySelector('.cgdp-embed-card') as HTMLElement;
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

		const card = document.querySelector('.cgdp-embed-card') as HTMLElement;
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

		const card = document.querySelector('.cgdp-embed-card') as HTMLElement;
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

		const card = document.querySelector('.cgdp-embed-card') as HTMLElement;
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
});
