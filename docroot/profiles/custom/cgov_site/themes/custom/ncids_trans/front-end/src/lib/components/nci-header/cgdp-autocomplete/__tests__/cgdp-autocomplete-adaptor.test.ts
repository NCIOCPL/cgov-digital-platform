import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import * as nock from 'nock';
import CgdpAutocompleteAdapter from '../cgdp-autocomplete-adapter';
import axios from 'axios';
axios.defaults.adapter = require('axios/lib/adapters/http');

describe('cgdp-megamenu-adapter', () => {
	let consoleError: jest.SpyInstance;

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
			return null;
		});
	});

	afterEach(() => {
		document.getElementsByTagName('body')[0].innerHTML = '';
		consoleError.mockRestore();
	});

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterAll(() => {
		nock.cleanAll();
		nock.enableNetConnect();
		jest.restoreAllMocks();
	});

	const clientAutocomplete = axios.create({
		baseURL: 'https://webapis.cancer.gov/sitewidesearch/v1/',
		responseType: 'json',
	});

	it('the adapter', async () => {
		const scope = nock('https://webapis.cancer.gov/sitewidesearch/v1/')
			.get('/Autosuggest/cgov/en/can')
			.once()
			.reply(200, {
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
			});
		const ACSource = new CgdpAutocompleteAdapter(
			clientAutocomplete,
			'cgov',
			'en'
		);
		const terms = await ACSource.getAutocompleteSuggestions('can');
		expect(terms).toHaveLength(10);

		scope.isDone();
	});

	it('handles bad responses', async () => {
		const scope = nock('https://webapis.cancer.gov/sitewidesearch/v1/')
			.get('/Autosuggest/foo/en/can')
			.once()
			.reply(404);
		const ACSource = new CgdpAutocompleteAdapter(
			clientAutocomplete,
			'foo',
			'en'
		);

		const terms = await ACSource.getAutocompleteSuggestions('can');

		expect(terms).toHaveLength(0);
		expect(consoleError).toHaveBeenCalledWith(
			'Autosuggest Fetch Error: Error: Request failed with status code 404'
		);

		scope.isDone();
	});
});
