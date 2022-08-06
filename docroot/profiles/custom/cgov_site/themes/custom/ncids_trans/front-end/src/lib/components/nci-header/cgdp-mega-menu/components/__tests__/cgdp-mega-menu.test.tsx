import CgdpJsx from 'src/lib/core/jsx';

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import getCgdpMegaMenu from '../cgdp-mega-menu';
import { CgdpMegaMenuData } from '../../types';

describe('mega menu components', () => {
	let consoleWarn: jest.SpyInstance;

	beforeEach(() => {
		consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
			return null;
		});
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		consoleWarn.mockRestore();
		jest.resetAllMocks();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('handles invalid types', async () => {
		const mmData = {
			primary_nav_label: 'primary label',
			primary_nav_url: '#/root',
			items: [
				{
					type: 'bad-item',
				},
			],
		};
		getCgdpMegaMenu(mmData as unknown as CgdpMegaMenuData, '1234');
		expect(consoleWarn).toHaveBeenCalledWith(
			'Unknown mega menu item type bad-item'
		);
	});

	it('handles empty items', async () => {
		const mmData = {
			primary_nav_label: 'primary label',
			primary_nav_url: '#/root',
		};
		const myComponent = getCgdpMegaMenu(
			mmData as unknown as CgdpMegaMenuData,
			'1234'
		);
		expect(myComponent.innerHTML).toBe(
			`<div class="grid-container"><div class="grid-row grid-gap-1"><div class="grid-col-3 nci-megamenu__primary-pane"><a class="nci-megamenu__primary-link" href="#/root">primary label</a></div><div class="nci-megamenu__items-pane grid-col-9"></div></div></div>`
		);
	});
});
