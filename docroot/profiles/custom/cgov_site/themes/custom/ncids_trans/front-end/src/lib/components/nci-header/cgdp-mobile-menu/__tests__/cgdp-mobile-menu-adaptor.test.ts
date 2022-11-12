import CgdpMobileMenuAdaptor from '../cgdp-mobile-menu-adaptor';

import Menu1500005 from './expected/menu-1500005';
import Menu1500004 from './expected/menu-1500004';
import Menu1500002 from './expected/menu-1500002';
import Menu1500001 from './expected/menu-1500001';
import Menu1500000 from './expected/menu-1500000';

import * as nock from 'nock';
import axios from 'axios';

describe('CGDP Mobile Menu Adaptor', () => {
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

	it('starting at A.1.1.1.1.1.1 loads the correct navs to A.2', async () => {
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/section-nav/1500002.json')
			.get('/taxonomy/term/1500000/mobile-nav')
			.once()
			.replyWithFile(200, __dirname + '/data/mobile-nav/1500000.json');

		const adaptor = new CgdpMobileMenuAdaptor(
			false,
			client,
			'1500005',
			{ id: '1500002', menu_type: 'section-nav' },
			'en'
		);

		const initialMenuID = await adaptor.getInitialMenuId();
		expect(initialMenuID).toBe('1500005');

		const initialMenuData = await adaptor.getNavigationLevel(initialMenuID);
		expect(initialMenuData).toEqual(Menu1500005);

		// Pretend to have hit the back button.
		const back1MenuData = await adaptor.getNavigationLevel('1500004');
		expect(back1MenuData).toEqual(Menu1500004);

		// Lets jump to the top of the current fetched menu.
		const sectionRootMenuData = await adaptor.getNavigationLevel('1500002');
		expect(sectionRootMenuData).toEqual(Menu1500002);

		// Let's move into the mobile nav.
		const aMenuData = await adaptor.getNavigationLevel('1500001');
		expect(aMenuData).toEqual(Menu1500001);

		// Finally, lets go to the top. (This would be Main Menu as the back button)
		const testRootMenuData = await adaptor.getNavigationLevel('1500000');
		expect(testRootMenuData).toEqual(Menu1500000);

		scope.isDone();
	});
});
