import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import * as nock from 'nock';

import * as eddlUtil from '../../../core/analytics/eddl-util';
import headerInit from '../nci-header';

import { nciHeaderAutosuggestDom } from './nci-header.autosuggest.dom';
import { headerWithDataMenuId as nciHeaderWithoutSearchCollection } from './nci-header.mega-menu.dom';
import { headerWithoutSearch } from './nci-header.without-search.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('nci-header - autocomplete analytics', () => {
	let consoleError: jest.SpyInstance;

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
			return null;
		});
		window.ncidsNavInfo = {
			nav: { id: '309', menu_type: 'mobile-nav' },
			item_id: 309,
		};
	});

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
		delete (window as Partial<Window>).CDEConfig;
	});

	afterAll(() => {
		nock.cleanAll();
		nock.enableNetConnect();
		jest.restoreAllMocks();
	});

	it('checks autocomplete analytics', async () => {
		const user = userEvent.setup();
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		(window as Partial<Window>).CDEConfig = {
			general: {
				mediaServer: 'http://example.org',
			},
			sitewideSearchConfig: {
				searchApiServer: 'http://localhost',
			},
		};

		const scope = nock('http://localhost')
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

		document.body.appendChild(nciHeaderAutosuggestDom());

		headerInit();

		// Click on search
		const combobox = screen.getByRole('combobox');
		await user.click(combobox);

		// Search "can" and select the first option
		await user.keyboard('can');
		const terms = await screen.findAllByRole('option');
		await user.click(terms[0]);

		// Click submit
		const searchButton = await screen.findByRole('button', {
			name: 'search',
		});
		fireEvent.submit(searchButton);

		// Clear and click on search
		await user.click(combobox);
		await user.clear(combobox);

		// Search "cancer" and do not select an option
		await user.keyboard('canc');
		await screen.findAllByRole('option');

		// Click submit
		const searchButton2 = await screen.findByRole('button', {
			name: 'search',
		});
		fireEvent.submit(searchButton2);

		// todo search for "types" and get none because it doesn't exist

		expect(spy).toHaveBeenNthCalledWith(
			0,
			'HeaderSearch:Submit',
			'HeaderSearch:Submit',
			{
				formType: 'SitewideSearch',
				searchTerm: 'breast cancer',
				autoSuggestUsage: 'Selected',
				charactersTyped: 'can',
				numCharacters: 3,
				numSuggestsSelected: 1,
				suggestItems: 10,
				suggestOptionValue: 'breast cancer',
				location: 'Header',
			}
		);

		expect(spy).toHaveBeenNthCalledWith(
			0,
			'HeaderSearch:Submit',
			'HeaderSearch:Submit',
			{
				formType: 'SitewideSearch',
				searchTerm: 'breast cancer',
				autoSuggestUsage: 'Selected',
				charactersTyped: 'can',
				numCharacters: 3,
				numSuggestsSelected: 1,
				suggestItems: 10,
				suggestOptionValue: 'breast cancer',
				location: 'Header',
			}
		);

		scope.isDone();
	});

	it('logs an error when search collection without api key', async () => {
		document.body.appendChild(nciHeaderAutosuggestDom());
		headerInit();

		expect(consoleError).toHaveBeenCalledWith(
			'CDEConfig searchApiServer must be provided'
		);
	});

	it('does not break when there is no search collection', async () => {
		document.body.appendChild(nciHeaderWithoutSearchCollection());
		headerInit();

		const autocompleteInstance =
			document.getElementsByClassName('nci-autocomplete');
		expect(autocompleteInstance).toHaveLength(0);
	});

	it('does not break when there is not search box', async () => {
		document.body.appendChild(headerWithoutSearch());
		headerInit();
		const autocompleteInstance =
			document.getElementsByClassName('nci-autocomplete');
		expect(autocompleteInstance).toHaveLength(0);
	});
});
