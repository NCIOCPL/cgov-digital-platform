import CgdpMobileMenuAdaptor from '../cgdp-mobile-menu-adaptor';

describe('CGDP Mobile Menu Adaptor', () => {
	it('mocks code coverage - replacement', () => {
		const source = new CgdpMobileMenuAdaptor();

		expect(() => {
			source.getInitialMenuId();
		}).toThrow('');

		expect(() => {
			source.getNavigationLevel('5');
		}).toThrow('');
	});
});
