import CgdpMobileMenuAdapter from '../cgdp-mobile-menu-adapter';

// Expected Menu Data (Cleaned from response data)
import ExpectedMenu1500000 from './expected/en/menu-1500000';
import ExpectedMenu1500001 from './expected/en/menu-1500001';
import ExpectedMenu1500002 from './expected/en/menu-1500002';
import ExpectedMenu1500028 from './expected/es/menu-1500028';
import ExpectedMenu1500029 from './expected/es/menu-1500029';
import ExpectedMenu1500042 from './expected/en/menu-1500042';
import ExpectedMenu1500043 from './expected/en/menu-1500043';
import ExpectedMenu1500044 from './expected/en/menu-1500044';

// Mobile Menu Response Data (Raw JSON from API)
import * as MobileNavData1500000 from './data/mobile-nav/1500000.json';
import * as WeightedMobileNavData1500000 from './data/mobile-nav/1500000-weights.json';
import * as SpanishMobileNavData1500028 from './data/mobile-nav/1500028.json';
import * as MobileNavData1500042 from './data/section-nav/1500042.json';
import * as MobileNavData1500043 from './data/section-nav/1500043.json';
import * as MobileNavData844114 from './data/section-nav/844114.json';

describe('CGDP Mobile Menu Adapter', () => {
	const client = 'http://localhost/';
	const clientSpanish = 'http://localhost/espanol/';

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('handles bad api responses', async () => {
		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500005',
			{ id: '1500002', menu_type: 'section-nav' },
			'en',
			'/a'
		);

		// Mock the fetch response for an error. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: false,
			status: 400,
			json: () => MobileNavData1500000,
		});

		await expect(adapter.getNavigationLevel('15000005')).rejects.toThrow(
			'Mobile menu unexpected status 400 fetching 1500002/section-nav'
		);
	});

	it('Nav API is broken', async () => {
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
	});

	it('starting at the root level it populates the navigation, then navigates down two levels, before returning to the root menu', async () => {
		const adapter = new CgdpMobileMenuAdapter(
			false,
			client,
			'1500000',
			{ id: '1500001', menu_type: 'section-nav' },
			'en',
			'/a'
		);

		// Check the initial menu id is correct. This is the id that the adapter will start at,
		// and should be the current page or section.
		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('1500000');

		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => MobileNavData1500000,
		});

		// Get the menu data for the initial menu. This should be the menu data for A.
		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(ExpectedMenu1500000);

		// Let's move deeper into the mobile nav.
		const aMenuData = await adapter.getNavigationLevel('1500001');
		expect(aMenuData).toEqual(ExpectedMenu1500001);

		// Let's move even deeper into the mobile nav.
		const aMenuData2 = await adapter.getNavigationLevel('1500002');
		expect(aMenuData2).toEqual(ExpectedMenu1500002);

		// Finally, lets go back to the previous level. (This would be Main Menu as the back button)
		const testRootMenuData = await adapter.getNavigationLevel('1500000');
		expect(testRootMenuData).toEqual(ExpectedMenu1500000);
	});

	it('sorted by weights', async () => {
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

		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => WeightedMobileNavData1500000,
		});

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(ExpectedMenu1500000);
	});

	it('(spanish) starting at C.1.1.1.1 loads the correct navs to root', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => SpanishMobileNavData1500028,
		});

		const adapter = new CgdpMobileMenuAdapter(
			false,
			clientSpanish,
			'1500028',
			{ id: '1500030', menu_type: 'section-nav' },
			'es',
			'/c'
		);

		const initialMenuID = await adapter.getInitialMenuId();
		expect(initialMenuID).toBe('1500028');

		const initialMenuData = await adapter.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(ExpectedMenu1500028);

		// Let's move into the mobile nav.
		const aMenuData = await adapter.getNavigationLevel('1500029');
		expect(aMenuData).toEqual(ExpectedMenu1500029);

		// // Finally, lets go to the top. (This would be Main Menu as the back button)
		const testRootMenuData = await adapter.getNavigationLevel('1500028');
		expect(testRootMenuData).toEqual(ExpectedMenu1500028);
	});

	it('starting at A.5.1.1 loads the correct navs to A.5', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => MobileNavData1500043,
		});

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
		expect(initialMenuData).toEqual(ExpectedMenu1500044);

		const parentData = await adapter.getNavigationLevel('1500043');
		expect(parentData).toEqual(ExpectedMenu1500043);

		// Mock the fetch response for the next menu. This is the menu
		// that the adapter will load when going to the 2nd parent menu.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => MobileNavData1500042,
		});

		const parentData2 = await adapter.getNavigationLevel('1500042');
		expect(parentData2).toEqual(ExpectedMenu1500042);
	});

	it('starting at Publications loads the main menu which leads to mobile menu', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => MobileNavData844114,
		});

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
	});
});
