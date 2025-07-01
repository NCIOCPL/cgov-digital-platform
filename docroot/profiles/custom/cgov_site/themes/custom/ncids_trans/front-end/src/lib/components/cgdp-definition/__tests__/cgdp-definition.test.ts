import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import initialize, {
	getDictionaryRequestParameters,
	dictionaryPopupAnalytics,
} from '../cgdp-definition';
import { trackOther } from '../../../core/analytics/eddl-util';

window.fetch = jest.fn().mockReturnValue({
	response: {
		ok: true,
	},
});

// Mock the imported modules
jest.mock('../../../core/analytics/eddl-util', () => ({
	trackOther: jest.fn(),
}));

jest.mock('@nciocpl/ncids-js/usa-modal', () => ({
	USAModal: {
		createConfig: jest.fn().mockReturnValue({
			handleModalOpen: jest.fn(),
			updateBody: jest.fn(),
		}),
	} as unknown as USAModal,
}));

describe('cgdp-definition', () => {
	beforeEach(() => {
		document.body.innerHTML = `
      <a class="cgdp-definition-link" data-gloss-id="123" data-gloss-dictionary="test-dict" data-gloss-audience="public" data-gloss-lang="en">Test Link</a>
    `;
	});

	it('should have getDictionaryRequestParameters return correct parameters', () => {
		const element = document.querySelector(
			'.cgdp-definition-link'
		) as HTMLElement;
		const params = getDictionaryRequestParameters(element);
		expect(params).toEqual({
			dictionary: 'test-dict',
			audience: 'public',
			language: 'en',
			id: '123',
		});
	});

	it('should track analytics event via dictionaryPopupAnalytics', () => {
		const element = document.querySelector(
			'.cgdp-definition-link'
		) as HTMLElement;
		dictionaryPopupAnalytics(true, element, 123);
		expect(trackOther).toHaveBeenCalledWith(
			'Body:Glossified:PopupLoad',
			'Body:Glossified:PopupLoad',
			{
				location: 'Body',
				componentType: 'Glossified Link',
				linkType: 'Glossary Load',
				linkText: 'Test Link',
				totalLinks: 1,
				linkPosition: 1,
				termID: 123,
			}
		);
	});

	it('should initialize the definition link and should handle click event', async () => {
		const user = userEvent.setup();
		const modalConfig = {
			id: 'modal-callback',
			forced: false,
			modifier: 'usa-modal--nci-maxh',
			title: 'some example',
		};
		const modal = USAModal.createConfig(modalConfig);
		initialize();
		const element = document.querySelector(
			'.cgdp-definition-link'
		) as HTMLElement;

		await user.click(element);

		expect(modal.handleModalOpen).toHaveBeenCalled();
	});

	it('should handle if there are no definition links gracefully', async () => {
		document.body.innerHTML = `<a></a>`;
		initialize();
		const element = document.querySelector(
			'.cgdp-definition-link'
		) as HTMLElement;

		expect(element).toBeNull();
		expect(initialize).not.toThrow();
	});
});
