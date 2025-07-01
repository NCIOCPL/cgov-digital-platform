import '@testing-library/jest-dom';
import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import {
	resetModal,
	getDictionaryResponseFromElement,
} from '../modal-controls';

jest.mock('../../../services/glossary-api-client-v1', () => ({
	getTermById: jest.fn(),
}));
import { getTermById } from '../../../services/glossary-api-client-v1';

jest.mock('../cgdp-definition', () => ({
	getDictionaryRequestParameters: jest.fn().mockReturnValue({
		dictionary: 'cancer.gov',
		audience: 'patient',
		language: 'en',
		id: '1234',
	}),
	dictionaryPopupAnalytics: jest.fn(),
}));
jest.mock('@nciocpl/ncids-js/usa-modal', () => ({
	USAModal: {
		createConfig: jest.fn().mockReturnValue({
			handleModalOpen: jest.fn(),
			updateBody: jest.fn(),
		}),
	} as unknown as USAModal,
}));

let modal: USAModal;

describe('modal-controls', () => {
	beforeEach(() => {
		const modalConfig = {
			id: 'modal-callback',
			forced: false,
			modifier: 'usa-modal--nci-maxh',
			title: 'some example',
		};
		modal = USAModal.createConfig(modalConfig);
	});

	it('should update the modal with loading content', () => {
		// Act
		resetModal(modal);

		// Assert
		expect(modal.updateBody).toHaveBeenCalledWith('Loading Definition....');
	});

	// `<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>`;
	it('should update the modal with the successful response', async () => {
		(getTermById as jest.Mock).mockImplementation(() => {
			return Promise.resolve({
				definition: 'the definition html',
				pronunciation: { key: '', audio: '' },
			});
		});
		const definitionLink = document.createElement('a');
		definitionLink.setAttribute(
			'href',
			'/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English'
		);
		definitionLink.setAttribute(
			'data',
			"gloss-id: '45214', gloss-dictionary: 'cancer.gov', gloss-audience: 'patient', gloss-lang: 'en'"
		);

		await getDictionaryResponseFromElement(definitionLink, modal);
		expect(modal.updateBody).toHaveBeenCalled();
	});
	it('should update the modal with the failure message', async () => {
		(getTermById as jest.Mock).mockImplementation(() => {
			return Promise.resolve({});
		});
		const definitionLink = document.createElement('a');
		definitionLink.setAttribute(
			'href',
			'/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English'
		);
		definitionLink.setAttribute(
			'data',
			"gloss-id: '45214', gloss-dictionary: 'cancer.gov', gloss-audience: 'patient', gloss-lang: 'en'"
		);

		await getDictionaryResponseFromElement(definitionLink, modal);
		expect(modal.updateBody).toHaveBeenCalled();
	});
});
