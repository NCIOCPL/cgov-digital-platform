import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { getTermById, getTermByName } from '../glossary-api-client-v1';

// Mock the fetch function
global.fetch = jest.fn() as jest.Mock;

describe('glossary-api-client-v1', () => {
	beforeEach(() => {
		jest.spyOn(window, 'fetch');
	});

	// Test for fetchData function
	it('should fetch data successfully', async () => {
		const mockResponse = { term: 'Cancer' };
		(fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockResponse,
		});

		const data = await getTermById('NCI', 'Patient', 'en', '123');
		expect(data).toEqual(mockResponse);
		expect(fetch).toHaveBeenCalledWith(
			'https://webapis.cancer.gov/glossary/v1/Terms/NCI/Patient/en/123?useFallback=true'
		);
	});

	it('should throw an error if fetch fails', async () => {
		(fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 404,
		});

		await expect(getTermById('NCI', 'Patient', 'en', '123')).rejects.toThrow(
			'HTTP error! Status: 404'
		);
	});

	// Test for getTermByName function
	it('should fetch term by name successfully', async () => {
		const mockResponse = { term: 'Cancer' };
		(fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockResponse,
		});

		const data = await getTermByName('NCI', 'Patient', 'en', 'cancer');
		expect(data).toEqual(mockResponse);
		expect(fetch).toHaveBeenCalledWith(
			'https://webapis.cancer.gov/glossary/v1/Terms/NCI/Patient/en/cancer?useFallback=true'
		);
	});

	it('should throw an error if fetch fails for getTermByName', async () => {
		(fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 404,
		});

		await expect(
			getTermByName('NCI', 'Patient', 'en', 'cancer')
		).rejects.toThrow('HTTP error! Status: 404');
	});
});
