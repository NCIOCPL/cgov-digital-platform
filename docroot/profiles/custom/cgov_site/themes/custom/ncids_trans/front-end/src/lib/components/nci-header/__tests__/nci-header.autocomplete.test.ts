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

const response = {
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

	it('sends correct analytics when no options offered', async () => {
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
			.reply(200, response);

		document.body.appendChild(nciHeaderAutosuggestDom());

		headerInit();

		// Click on search
		const combobox = await screen.findByRole('combobox');
		await user.click(combobox);

		// Search "ca"
		await user.keyboard('ca');

		// Click submit
		fireEvent.submit(
			await screen.findByRole('button', {
				name: 'search',
			})
		);

		expect(spy).toHaveBeenCalledWith(
			'HeaderSearch:Submit',
			'HeaderSearch:Submit',
			{
				formType: 'SitewideSearch',
				searchTerm: 'ca',
				autoSuggestUsage: 'None',
				charactersTyped: null,
				numCharacters: null,
				numSuggestsSelected: null,
				suggestItems: 0,
				location: 'Header',
			}
		);

		scope.isDone();
	});

	it('sends correct analytics when options are offered', async () => {
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
			.reply(200, response);

		document.body.appendChild(nciHeaderAutosuggestDom());

		headerInit();

		// Click on search
		const combobox = await screen.findByRole('combobox');
		await user.click(combobox);

		// Search "can" and don't select an option
		await user.keyboard('can');
		const options = await screen.findAllByRole('option');

		// Make sure we have options as expected
		expect(options[0]).toHaveTextContent('breast cancer');

		// Click submit
		fireEvent.submit(
			await screen.findByRole('button', {
				name: 'search',
			})
		);

		expect(spy).toHaveBeenCalledWith(
			'HeaderSearch:Submit',
			'HeaderSearch:Submit',
			{
				formType: 'SitewideSearch',
				searchTerm: 'can',
				autoSuggestUsage: 'Offered',
				charactersTyped: null,
				numCharacters: null,
				numSuggestsSelected: null,
				suggestItems: 10,
				location: 'Header',
			}
		);

		scope.isDone();
	});

	it('sends correct analytics when option is selected', async () => {
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
			.reply(200, response);

		document.body.appendChild(nciHeaderAutosuggestDom());

		headerInit();

		// Click on search
		const combobox = await screen.findByRole('combobox');
		await user.click(combobox);

		// Search "can" and select the first option
		await user.keyboard('can');
		const options = await screen.findAllByRole('option');
		await user.click(options[0]);

		// Click submit
		fireEvent.submit(
			await screen.findByRole('button', {
				name: 'search',
			})
		);

		expect(spy).toHaveBeenCalledWith(
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
