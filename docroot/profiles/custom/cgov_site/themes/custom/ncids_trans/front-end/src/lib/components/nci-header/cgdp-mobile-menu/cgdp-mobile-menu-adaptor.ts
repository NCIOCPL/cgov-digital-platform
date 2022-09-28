import type { MobileMenuAdaptor, MobileMenuData } from '@nciocpl/ncids-js';

type DrupalMenuItem = {
	//children?: DrupalMenuItem[];
	children?: [];
	id: string;
	is_main_nav_root: boolean;
	is_section_nav_root: boolean;
	label: string;
	langcode: 'en' | 'es';
	navigation_display_options?: object; // todo unknown
	path: string;
	weight: string;
};

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMobileMenuAdaptor implements MobileMenuAdaptor {
	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId: boolean;

	constructor(useUrlForNavigationId: boolean) {
		this.useUrlForNavigationId = useUrlForNavigationId;
	}

	/**
	 * @todo jsdoc
	 */
	async getInitialMenuId(): Promise<string | number> {
		const sidenav = document.querySelector(
			' .usa-sidenav [aria-current=page][data-menu-id]'
		);
		if (sidenav) {
			console.log('sidenav', sidenav);
			console.log('sidenav', sidenav);
			console.log('sidenav', sidenav.getAttribute('data-menu-id'));
		}
		// todo can nav be hardcoded? how else to retrieve?
		const homeID = document.documentElement.lang === 'es' ? 6703 : 309;
		const menuID = sidenav
			? sidenav.getAttribute('data-menu-id') || homeID
			: homeID;

		console.log('menu', menuID);

		return menuID;
	}

	/**
	 * @todo jsdoc
	 * @param id
	 */
	async getNavigationLevel(id: string | number): Promise<MobileMenuData> {
		/*
			TCGA Site Section: https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/1126555/section-nav
			CCG Site Nav: https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/866278/section-nav
			Organizations: https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/11482/section-nav
			Mobile Nav : https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/309/mobile-nav
		 */

		// todo is origin best?
		const url = window.location.origin;

		// todo checks for path?
		//const path = `${url}/taxonomy/term/${id}/mobile-nav`;
		const path = `${url}/taxonomy/term/${id}/section-nav`;

		// todo user feedback is shit for onclick waiting for response
		// todo add fetch settings? method, headers?
		// todo use axios instead? https://stackoverflow.com/a/67560073/1389807
		return await fetch(path)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				return response.json();
			})
			.then((menuItem) => {
				const nav = this.createMobileMenuData(menuItem);
				console.log('nav', nav);
				return nav;
			});
	}

	/**
	 * @todo jsdoc
	 * @param menuItem
	 *
	 * @todo DS sets { data-options: 0} && { data-isroot: false} and never anything else?
	 */
	createMobileMenuData(menuItem: DrupalMenuItem): MobileMenuData {
		console.log(menuItem);
		return {
			id: menuItem.id,
			label: menuItem.label,
			path: menuItem.path,
			langcode: menuItem.langcode,
			hasChildren: !!(menuItem.children && menuItem.children.length),
			items:
				menuItem.children && menuItem.children.length ? menuItem.children : [],
			//parent: null, // todo parent should only be null on section root or nav?
			parent: {
				id: menuItem.id,
				label: menuItem.label,
				path: '/', // todo/note: parent is slash, then MAIN MENU, otherwise BACK
				langcode: menuItem.langcode,
				hasChildren: !!(menuItem.children && menuItem.children.length),
			},
		};
	}
}

export default CgdpMobileMenuAdaptor;
