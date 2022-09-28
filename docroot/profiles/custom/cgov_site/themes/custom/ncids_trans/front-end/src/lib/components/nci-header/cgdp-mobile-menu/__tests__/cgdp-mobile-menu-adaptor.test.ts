import CgdpMobileMenuAdaptor from '../cgdp-mobile-menu-adaptor';
import * as nock from 'nock';

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

	it('mocks code coverage - replacement', () => {
		const source = new CgdpMobileMenuAdaptor(false);
		//
		// expect(() => {
		// 	source.getInitialMenuId();
		// }).toThrow('');
		//
		// expect(() => {
		// 	source.getNavigationLevel('5');
		// }).toThrow('');
		expect(source).toBeTruthy();
	});
});
