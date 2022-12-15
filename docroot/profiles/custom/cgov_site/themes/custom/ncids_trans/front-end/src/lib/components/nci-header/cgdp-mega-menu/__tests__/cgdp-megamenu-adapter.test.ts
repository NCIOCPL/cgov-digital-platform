import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import CgdpMegaMenuAdaptor from '../cgdp-megamenu-adapter';
import getGoodMegaMenu from './data/good-mega-menu';
import getHeadingOnlyListMegaMenu from './data/heading-only-list';
import * as nock from 'nock';

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

	it('makes the mega menu', async () => {
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1234/mega-menu')
			.once()
			.replyWithFile(200, __dirname + '/data/good-mega-menu.json');

		const adapter = new CgdpMegaMenuAdaptor(client);
		const expectedHtml = getGoodMegaMenu() as HTMLElement;
		const actualHtml = await adapter.getMegaMenuContent('1234');

		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();

		scope.isDone();
	});

	it('handles caching', async () => {
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1234/mega-menu')
			.once()
			.replyWithFile(200, __dirname + '/data/good-mega-menu.json');

		const adapter = new CgdpMegaMenuAdaptor(client);
		await adapter.getMegaMenuContent('1234');
		await adapter.getMegaMenuContent('1234');

		//The once and scope.isDone should throw if not.
		// This is how you do it...
		expect(true).toBeTruthy();

		scope.isDone();
	});

	it('handles mega menu lists without items', async () => {
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1234/mega-menu')
			.once()
			.replyWithFile(200, __dirname + '/data/heading-only-list.json');

		const adapter = new CgdpMegaMenuAdaptor(client);
		const expectedHtml = getHeadingOnlyListMegaMenu() as HTMLElement;
		const actualHtml = await adapter.getMegaMenuContent('1234');
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();

		scope.isDone();
	});

	it('handles bad responses', async () => {
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1234/mega-menu')
			.once()
			.reply(404);

		const adapter = new CgdpMegaMenuAdaptor(client);
		const expectedHtml = document.createElement('div');
		const actualHtml = await adapter.getMegaMenuContent('1234');
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
		expect(consoleError).toHaveBeenCalledWith(
			'Megamenu unexpected status 404 fetching 1234'
		);
		scope.isDone();
	});

	it('handles errors', async () => {
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1234/mega-menu')
			.once()
			.replyWithError('Stuff broke');

		const adapter = new CgdpMegaMenuAdaptor(client);
		const expectedHtml = document.createElement('div');
		const actualHtml = await adapter.getMegaMenuContent('1234');
		expect(actualHtml.isEqualNode(expectedHtml)).toBeTruthy();
		// The first call to console error must be Axios doing a console.error on
		// the exception.
		expect(consoleError).toHaveBeenNthCalledWith(
			2,
			'Could not fetch megamenu for 1234.'
		);
		scope.isDone();
	});

	// Click heading
	// Click sublink
	// Click Primary
});
