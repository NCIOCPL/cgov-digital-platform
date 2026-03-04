import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import CgdpMegaMenuAdapter from '../cgdp-megamenu-adapter';
import getGoodMegaMenu from './data/good-mega-menu';
import getHeadingOnlyListMegaMenu from './data/heading-only-list';

import * as goodMegaMenuData from './data/good-mega-menu.json';
import * as headingOnlyListMegaMenuData from './data/heading-only-list.json';

describe('cgdp-megamenu-adapter', () => {
	let consoleError: jest.SpyInstance;

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
			return null;
		});
	});

	afterEach(() => {
		consoleError.mockRestore();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	const client = 'http://localhost/';

	it('makes the mega menu', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => goodMegaMenuData,
		});

		const adapter = new CgdpMegaMenuAdapter(client);
		const expectedHtml = getGoodMegaMenu() as HTMLElement;
		const actualHtml = await adapter.getMegaMenuContent('1234');

		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
	});

	it('handles caching', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => goodMegaMenuData,
		});

		const adapter = new CgdpMegaMenuAdapter(client);
		await adapter.getMegaMenuContent('1234');
		await adapter.getMegaMenuContent('1234');

		const expectedHtml = getGoodMegaMenu() as HTMLElement;
		const actualHtml = await adapter.getMegaMenuContent('1234');

		expect(global.fetch).toHaveBeenCalledTimes(1);
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
	});

	it('handles mega menu lists without items', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: true,
			status: 200,
			json: () => headingOnlyListMegaMenuData,
		});

		const adapter = new CgdpMegaMenuAdapter(client);
		const expectedHtml = getHeadingOnlyListMegaMenu() as HTMLElement;
		const actualHtml = await adapter.getMegaMenuContent('1234');
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
	});

	it('handles bad responses', async () => {
		// Mock the fetch response for the initial menu. This is the menu that the adapter will start in.
		global.fetch = jest.fn().mockReturnValueOnce({
			ok: false,
			status: 404,
			json: () => {
				return { error: 'Not Found' };
			},
		});

		const adapter = new CgdpMegaMenuAdapter(client);
		const expectedHtml = document.createElement('div');
		const actualHtml = await adapter.getMegaMenuContent('1234');
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
		expect(consoleError).toHaveBeenCalledWith(
			'Megamenu unexpected status 404 fetching 1234'
		);
	});

	it('handles fetch rejections', async () => {
		// Mock fetch to reject (e.g., network error).
		global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
		const adapter = new CgdpMegaMenuAdapter(client);
		const expectedHtml = document.createElement('div');
		const actualHtml = await adapter.getMegaMenuContent('1234');
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
		expect(consoleError).toHaveBeenCalled();
	});

	// Click heading
	// Click sublink
	// Click Primary
});
