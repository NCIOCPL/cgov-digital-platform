import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import {
	getParamsOrDefaults,
	cleanId,
	cleanKnownAudience,
	definitionClickHandler,
	addListenersToDrupalGlossaryTerms,
	addListenersToPdqAndLegacyGlossaryTerms,
} from '../cgdp-definition-legacy-helpers';

window.fetch = jest.fn();

describe('cgdp-definition-legacy-helpers', () => {
	describe('getParamsOrDefaults', () => {
		it('should return default values when both glossary and audience are not provided', () => {
			expect(getParamsOrDefaults('', '')).toEqual({
				glossary: 'Cancer.gov',
				audience: 'Patient',
			});
		});

		it('should return correct values when only audience is provided', () => {
			expect(getParamsOrDefaults('', 'patient')).toEqual({
				glossary: 'Cancer.gov',
				audience: 'Patient',
			});
			expect(getParamsOrDefaults('', 'healthprofessional')).toEqual({
				glossary: 'NotSet',
				audience: 'HealthProfessional',
			});
			expect(getParamsOrDefaults('', 'unknown')).toEqual({
				glossary: 'Unknown',
				audience: 'unknown',
			});
		});

		it('should return correct values when only glossary is provided', () => {
			expect(getParamsOrDefaults('Cancer.gov', '')).toEqual({
				glossary: 'Cancer.gov',
				audience: 'Patient',
			});
			expect(getParamsOrDefaults('OtherGlossary', '')).toEqual({
				glossary: 'OtherGlossary',
				audience: 'HealthProfessional',
			});
		});

		it('should return provided values when both glossary and audience are provided', () => {
			expect(getParamsOrDefaults('SomeGlossary', 'SomeAudience')).toEqual({
				glossary: 'SomeGlossary',
				audience: 'SomeAudience',
			});
		});
	});

	describe('cleanId', () => {
		it('should convert CDR prefixed string to integer', () => {
			expect(cleanId('CDR000123')).toBe(123);
		});
	});

	describe('cleanKnownAudience', () => {
		it('should return "Patient" for "patient"', () => {
			expect(cleanKnownAudience('patient')).toBe('Patient');
		});

		it('should return "HealthProfessional" for "healthprofessional"', () => {
			expect(cleanKnownAudience('healthprofessional')).toBe(
				'HealthProfessional'
			);
		});

		it('should return the original audience if not known', () => {
			expect(cleanKnownAudience('unknown')).toBe('unknown');
		});
	});

	describe('definitionClickHandler', () => {
		let mockModal: USAModal;
		let mockEvent: Event;

		beforeEach(() => {
			mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			mockEvent = {
				preventDefault: jest.fn(),
				currentTarget: document.createElement('a'),
			} as unknown as Event;
		});

		it('should call resetModal and handleModalOpen on click', async () => {
			const handler = definitionClickHandler(
				'glossary',
				'audience',
				'en',
				123,
				mockModal
			);
			await handler(mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockModal.handleModalOpen).toHaveBeenCalledWith(mockEvent);
		});
	});

	describe('addListenersToDrupalGlossaryTerms', () => {
		it('should add event listeners to glossary links', () => {
			document.body.innerHTML = `<a class="definition" data-glossary-id="CDR000123" data-glossary-name="Cancer.gov" data-glossary-audience="patient"></a>`;
			const mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			addListenersToDrupalGlossaryTerms(mockModal);
			const link = document.querySelector('a.definition') as HTMLElement;
			expect(link).not.toHaveAttribute('onclick');

			// Use fireEvent to simulate the click
			fireEvent.click(link);
			expect(mockModal.handleModalOpen).toHaveBeenCalled();
		});
		it('should not try to add event listeners if there is no glossary links', () => {
			document.body.innerHTML = `<a class="definition" data-glossary-name="Cancer.gov" data-glossary-audience="patient"></a>`;
			const mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			addListenersToDrupalGlossaryTerms(mockModal);
			const link = document.querySelector('a.definition') as HTMLElement;

			// Use fireEvent to simulate the click
			fireEvent.click(link);
			expect(mockModal.handleModalOpen).not.toHaveBeenCalled();
		});
	});

	describe('addListenersToPdqAndLegacyGlossaryTerms', () => {
		it('should add event listeners to legacy glossary links that DO NOT have a dictionary', () => {
			document.body.innerHTML = `<a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR000123&amp;version=Patient&amp;language=English"></a>`;
			const mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			addListenersToPdqAndLegacyGlossaryTerms(mockModal);
			const link = document.querySelector('a.definition');
			expect(link).not.toHaveAttribute('onclick');

			// Use fireEvent to simulate the click
			fireEvent.click(link as Element);
			expect(mockModal.handleModalOpen).toHaveBeenCalled();
		});
		it('should add event listeners to legacy glossary links that have a dictionary', () => {
			document.body.innerHTML = `<a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR000123&amp;version=Patient&amp;language=English&amp;dictionary=genetic"></a>`;
			const mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			addListenersToPdqAndLegacyGlossaryTerms(mockModal);
			const link = document.querySelector('a.definition') as HTMLElement;
			expect(link).not.toHaveAttribute('onclick');

			// Use fireEvent to simulate the click
			fireEvent.click(link);
			expect(mockModal.handleModalOpen).toHaveBeenCalled();
		});
		it('should add event listeners appropriately to legacy glossary links that have an onclick with defbyid', () => {
			document.body.innerHTML = `<a class="definition" onclick="javascript:popWindow('defbyid','CDR0000045693&amp;version=Patient&amp;language=English'); return false;" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045693&amp;version=Patient&amp;language=English">genes</a>`;
			const mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			addListenersToPdqAndLegacyGlossaryTerms(mockModal);
			const link = document.querySelector('a.definition') as HTMLElement;
			expect(link).not.toHaveAttribute('onclick');

			// Use fireEvent to simulate the click
			fireEvent.click(link);
			expect(mockModal.handleModalOpen).toHaveBeenCalled();
		});
		it('should not try to add event listeners if there is no glossary links', () => {
			document.body.innerHTML = `<a href="/Common/PopUps/popDefinition.aspx?id=CDR000123&amp;version=Patient&amp;language=English"></a>`;
			const mockModal = {
				handleModalOpen: jest.fn(),
				updateBody: jest.fn(),
			} as unknown as USAModal;
			addListenersToPdqAndLegacyGlossaryTerms(mockModal);
			const link = document.querySelector(
				'a[href*="popDefinition.aspx"]'
			) as HTMLElement;

			// Use fireEvent to simulate the click
			fireEvent.click(link);
			expect(mockModal.handleModalOpen).not.toHaveBeenCalled();
		});
	});
});
