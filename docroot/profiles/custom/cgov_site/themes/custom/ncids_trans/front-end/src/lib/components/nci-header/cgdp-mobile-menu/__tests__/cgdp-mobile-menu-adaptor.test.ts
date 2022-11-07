import CgdpMobileMenuAdaptor from '../cgdp-mobile-menu-adaptor';

import mobileMenuL1 from './data/mobile-nav-l1';
//import mobileMenuL2 from './data/mobile-nav-l2';

import * as nock from 'nock';
import axios from 'axios';

describe('CGDP Mobile Menu Adaptor', () => {
	let consoleError: jest.SpyInstance;

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
			return null;
		});
	});

	afterEach(() => {
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

	const client = axios.create({
		baseURL: 'http://localhost',
	});

	it('makes the mobile menu', async () => {
		Object.defineProperty(window, 'ncidsNavInfo', {
			writable: true,
			value: {
				nav: {
					id: '309',
					menu_type: 'mobile-nav',
				},
				item_id: 309,
			},
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/309/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav-api.json');

		const source = new CgdpMobileMenuAdaptor(false, client);
		const expectedID = '309';
		const actualID = await source.getInitialMenuId();
		const expectedResponse = mobileMenuL1();
		const actualResponse = await source.getNavigationLevel(expectedID);

		expect(actualID).toStrictEqual(expectedID);
		expect(actualResponse).toStrictEqual(expectedResponse);
		scope.isDone();
	});

	it('l2 mobile menu', async () => {
		Object.defineProperty(window, 'ncidsNavInfo', {
			writable: true,
			value: {
				nav: {
					id: '309',
					menu_type: 'mobile-nav',
				},
				item_id: 829,
			},
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/309/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav-api.json');

		const source = new CgdpMobileMenuAdaptor(false, client);
		const expectedID = '829';
		const actualID = await source.getInitialMenuId();
		//const expectedResponse = mobileMenuL2();
		//const actualResponse = await source.getNavigationLevel(expectedID);

		expect(actualID).toStrictEqual(expectedID);
		//expect(actualResponse).toStrictEqual(expectedResponse);
		scope.isDone();
	});

	// it('thorws error on fetch', async () => {
	// 	Object.defineProperty(window, 'ncidsNavInfo', {
	// 		writable: true,
	// 		value: {
	// 			nav: {
	// 				id: '309',
	// 				menu_type: 'mobile-nav',
	// 			},
	// 			item_id: 309,
	// 		},
	// 	});
	//
	// 	const scope = nock('http://localhost')
	// 		.get('/taxonomy/term/309/section-nav')
	// 		.once()
	// 		.replyWithFile(200, __dirname + '/data/mobile-nav-api.json');
	//
	// 	const source = new CgdpMobileMenuAdaptor(false, client);
	//+ 	await source.getNavigationLevel(309);
	//
	// 	expect(consoleError).toHaveBeenCalledWith(
	// 		'Could not fetch mobile menu for http://localhost/taxonomy/term/309/mobile-nav'
	// 	);
	//
	// 	scope.isDone();
	// });
});
