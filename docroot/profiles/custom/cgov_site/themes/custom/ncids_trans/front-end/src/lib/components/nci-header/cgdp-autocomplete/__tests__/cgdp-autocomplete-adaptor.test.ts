import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import CgdpAutocompleteAdapter from '../cgdp-autocomplete-adapter';

describe('cgdp-megamenu-adapter', () => {
	let consoleError: jest.SpyInstance;

	const apiResponse = {
		results: [
			{ term: 'breast cancer' },
			{ term: 'lung cancer' },
			{ term: 'cervical cancer' },
			{ term: 'ovarian cancer' },
			{ term: 'prostate cancer' },
			{ term: 'skin cancer' },
			{ term: 'liver cancer' },
			{ term: 'colon cancer' },
			{ term: 'pancreatic cancer' },
			{ term: 'bone cancer' },
		],
		total: 1173,
	};

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
			return null;
		});
	});

	afterEach(() => {
		document.getElementsByTagName('body')[0].innerHTML = '';
		consoleError.mockRestore();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('the adapter', async () => {
		// Mock the fetch response for an error. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => apiResponse,
		});
		const ACSource = new CgdpAutocompleteAdapter(
			'https://webapis.cancer.gov/sitewidesearch/v1/',
			'cgov',
			'en'
		);
		const terms = await ACSource.getAutocompleteSuggestions('can');
		expect(terms).toHaveLength(10);
	});

	it('handles bad responses', async () => {
		// Mock the fetch response for an error. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: false,
			status: 404,
			json: () => apiResponse,
		});
		const ACSource = new CgdpAutocompleteAdapter(
			'https://webapis.cancer.gov/sitewidesearch/v1/',
			'foo',
			'en'
		);

		const terms = await ACSource.getAutocompleteSuggestions('can');

		expect(terms).toHaveLength(0);
		expect(consoleError).toHaveBeenCalledWith(
			'Autosuggest Fetch Error: Error: Request failed with status code 404'
		);
	});
});
