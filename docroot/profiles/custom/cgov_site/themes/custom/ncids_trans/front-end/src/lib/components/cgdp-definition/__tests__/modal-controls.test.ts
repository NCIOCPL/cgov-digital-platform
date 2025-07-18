import '@testing-library/jest-dom';
import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { resetModal } from '../modal-controls';

jest.mock('@nciocpl/ncids-js/usa-modal', () => ({
	USAModal: {
		createConfig: jest.fn().mockReturnValue({
			handleModalOpen: jest.fn(),
			updateDialog: jest.fn(),
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
		expect(modal.updateDialog).toHaveBeenCalledWith({
			title: undefined,
			content: 'Loading Definition....',
		});
	});

	// `<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>`;
	it('should have getDictionaryRequestParameters return correct parameters', () => {
		const definitionLink = document.createElement('a');
		definitionLink.setAttribute(
			'href',
			'/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English'
		);
		definitionLink.setAttribute(
			'data',
			"gloss-id: '45214', gloss-dictionary: 'cancer.gov', gloss-audience: 'patient', gloss-lang: 'en'"
		);
		expect(modal.updateDialog).toHaveBeenCalled();
	});
});
