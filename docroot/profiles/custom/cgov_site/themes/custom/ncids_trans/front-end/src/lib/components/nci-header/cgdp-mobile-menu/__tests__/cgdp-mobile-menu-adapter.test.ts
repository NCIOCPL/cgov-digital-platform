import CgdpMobileMenuAdapter from '../cgdp-mobile-menu-adapter';

import Menu1500005 from './expected/en/menu-1500005';
import Menu1500004 from './expected/en/menu-1500004';
import Menu1500002 from './expected/en/menu-1500002';
import Menu1500001 from './expected/en/menu-1500001';
import Menu1500000 from './expected/en/menu-1500000';

import Menu1500028 from './expected/es/menu-1500028';
import Menu1500029 from './expected/es/menu-1500029';
import Menu1500032 from './expected/es/menu-1500032';

import Menu1500042 from './expected/en/menu-1500042';
import Menu1500043 from './expected/en/menu-1500043';
import Menu1500044 from './expected/en/menu-1500044';

import * as nock from 'nock';
import axios from 'axios';

describe('CGDP Mobile Menu Adapter', () => {
	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterAll(() => {
		nock.cleanAll();
		nock.enableNetConnect();
		jest.restoreAllMocks();
	});

	it('starting at A.1.1.1.1.1.1 loads the correct navs to A.2', async () => {
		const client = axios.create({
			baseURL: 'http://localhost',
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/1500002.json')
			.get('/taxonomy/term/1500000/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav/1500000.json');

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500005',
			{ id: '1500002', menu_type: 'section-nav' },
			'en',
			'/a'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('1500005');

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(Menu1500005);

		// Pretend to have hit the back button.
		const back1MenuData = await adapter.getNavigationLevel('1500004');
		expect(back1MenuData).toEqual(Menu1500004);

		// Lets jump to the top of the current fetched menu.
		const sectionRootMenuData = await adapter.getNavigationLevel('1500002');
		expect(sectionRootMenuData).toEqual(Menu1500002);

		// Let's move into the mobile nav.
		const aMenuData = await adapter.getNavigationLevel('1500001');
		expect(aMenuData).toEqual(Menu1500001);

		// Finally, lets go to the top. (This would be Main Menu as the back button)
		const testRootMenuData = await adapter.getNavigationLevel('1500000');
		expect(testRootMenuData).toEqual(Menu1500000);

		scope.isDone();
	});

	it('starting at A.5.1.1 loads the correct navs to A.5', async () => {
		const client = axios.create({
			baseURL: 'http://localhost',
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500043/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/1500043.json')
			.get('/taxonomy/term/1500042/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/1500042.json');

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500044',
			{ id: '1500043', menu_type: 'section-nav' },
			'en',
			'/a'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('1500044');

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(Menu1500044);

		const parentData = await adapter.getNavigationLevel('1500043');
		expect(parentData).toEqual(Menu1500043);

		const parentData2 = await adapter.getNavigationLevel('1500042');
		expect(parentData2).toEqual(Menu1500042);

		scope.isDone();
	});

	it('(spanish) starting at C.1.1.1.1 loads the correct navs to root', async () => {
		const client = axios.create({
			baseURL: 'http://localhost/espanol',
		});

		const scope = nock('http://localhost/espanol')
			.get('/taxonomy/term/1500030/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/1500030.json')
			.get('/taxonomy/term/1500028/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav/1500028.json');

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500032',
			{ id: '1500030', menu_type: 'section-nav' },
			'es',
			'/c'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('1500032');

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(Menu1500032);

		// Let's move into the mobile nav.
		const aMenuData = await adapter.getNavigationLevel('1500029');
		expect(aMenuData).toEqual(Menu1500029);

		// // Finally, lets go to the top. (This would be Main Menu as the back button)
		const testRootMenuData = await adapter.getNavigationLevel('1500028');
		expect(testRootMenuData).toEqual(Menu1500028);

		scope.isDone();
	});

	it('handles bad api responses for any status >= 300', async () => {
		const client = axios.create({
			baseURL: 'http://localhost',
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.reply(400);

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500005',
			{ id: '1500002', menu_type: 'section-nav' },
			'en',
			'/a'
		);

		await expect(adapter.getNavigationLevel('15000005')).rejects.toThrow(
			'Mobile menu unexpected status 400 fetching 1500002/section-nav'
		);

		scope.isDone();
	});

	it('sorted by weights', async () => {
		const client = axios.create({
			baseURL: 'http://localhost',
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500000/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav/1500000-weights.json');

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500000',
			{ id: '1500000', menu_type: 'mobile-nav' },
			'en',
			'/a'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('1500000');

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(Menu1500000);

		scope.isDone();
	});

	it('Nav API is broken', async () => {
		const client = axios.create({
			baseURL: 'http://localhost',
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/1500002.json')
			.get('/taxonomy/term/1500000/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav/1500000.json');

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500000',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			null,
			'en',
			'/a'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		await expect(adapter.getNavigationLevel(initialMenuID)).rejects.toThrow(
			'Section 1500000 cannot be found in the navigation.'
		);

		scope.isDone();
	});

	it('starting at Publications loads the main menu which leads to mobile menu', async () => {
		const client = axios.create({
			baseURL: 'http://localhost',
		});

		const scope = nock('http://localhost')
			.get('/taxonomy/term/844114/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/844114.json')
			.get('/taxonomy/term/309/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav-api.json');

		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'930167',
			{ id: '844114', menu_type: 'section-nav' },
			'en',
			'/publications'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('930167');

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData.parent?.label).toEqual('Back');

		const parentData = await adapter.getNavigationLevel('844114');
		expect(parentData.parent?.label).toEqual('Back');

		scope.isDone();
	});
});
