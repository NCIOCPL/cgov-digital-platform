import axios, { Axios } from 'axios';
import type {
	MobileMenuAdaptor,
	MobileMenuData,
	MobileMenuItem,
} from '@nciocpl/ncids-js';

/*
  TODO a list of known bugs:
  - Label 'Explore' does not exist in menus
  - response can be slow, needs better ux
  - what do if api fails
  - MobileMenuData and MobileMenuItem should probably not be so different
  - move types to own file
 */

/**
 * @todo jsdoc
 */
type DrupalMenuItem = {
	children: [];
	//children?: DrupalMenuItem[]; // whomp whomp no dice
	id: string;
	label: string;
	langcode: 'en' | 'es';
	path: string;
};

/**
 * @todo
 */
type DrupalParentInfo = {
	closest_id_in_parent: string;
	parent_link_item: DrupalMenuItem;
	parent_nav: NCIDSNavInfo;
};

/**
 * @todo jsdoc
 */
type DrupalSectionNav = {
	nav: DrupalMenuItem;
	parent_info?: DrupalParentInfo;
};

/**
 * @todo jsdoc
 */
type NCIDSNavInfo = {
	nav: NCIDSNavInfoNav;
	item_id: string | number;
};

/**
 * @todo jsdoc
 */
type NCIDSNavInfoNav = {
	id: string | number;
	menu_type: string;
};

/**
 * @todo jsdoc
 */
interface ExtendedWindow extends Window {
	ncidsNavInfo: NCIDSNavInfo;
}

/**
 * @todo jsdoc
 */
declare let window: ExtendedWindow;

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMobileMenuAdaptor implements MobileMenuAdaptor {
	/**
	 * Instance of an axios client.
	 */
	client: Axios;

	/**
	 * Data menu id - requested id of data to display.
	 * @protected
	 */
	protected initialNavMenuId?: string | number;

	/**
	 * Fetched menu data from api.
	 * @protected
	 */
	protected cgdpMenuData: DrupalSectionNav = {
		nav: {
			children: [],
			//children?: DrupalMenuItem[]; // whomp whomp no dice
			id: '',
			label: '',
			langcode: 'en',
			path: '',
		},
	};

	/**
	 * `.usa-sidenav` element if one is found; does not exist on home and landing pages
	 * @protected
	 */
	protected sidenav: HTMLElement | null;

	/**
	 * Fetched menu data from api, converted to required type for adaptor.
	 * @todo jsdoc
	 */
	// navTree: MobileMenuData = {
	// 	id: '',
	// 	label: '',
	// 	path: '',
	// 	langcode: '',
	// 	hasChildren: false,
	// 	items: [],
	// 	parent: null,
	// };

	navTree: DrupalMenuItem = {
		children: [],
		//children?: DrupalMenuItem[]; // whomp whomp no dice
		id: '',
		label: '',
		langcode: 'en',
		path: '',
	};

	parent: DrupalMenuItem | null = null;

	displayedData: MobileMenuData | null = null;

	/**
	 * Initial nav info, on default is atttached to html_head.
	 * @see ncids_trans_page_attachments_alter()
	 */
	ncidsNavInfo: NCIDSNavInfo;

	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId: boolean;

	/**
	 * @jsdoc
	 * @param useUrlForNavigationId
	 * @param {Axios} client an axios client
	 */
	constructor(useUrlForNavigationId: boolean, client: Axios) {
		this.useUrlForNavigationId = useUrlForNavigationId;
		this.ncidsNavInfo = window.ncidsNavInfo;
		console.log('this.ncidsNavInfo', this.ncidsNavInfo);
		this.sidenav = document.querySelector(
			'.usa-sidenav [aria-current=page][data-menu-id]'
		);
		this.client = client;
	}

	/**
	 * @todo jsdoc
	 * @return Returned ID should be the nav id that we want to display.
	 */
	async getInitialMenuId(): Promise<string | number> {
		return this.ncidsNavInfo.item_id.toString();
	}

	/**
	 * @todo jsdoc
	 * @param id
	 * @return Promise of MobileMenuData object that should display on selection.
	 */
	async getNavigationLevel(id: string | number): Promise<MobileMenuData> {
		/*
			TCGA Site Section: https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/1126555/section-nav
			CCG Site Nav: https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/866278/section-nav
			Organizations: https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/11482/section-nav
			Mobile Nav : https://ncigovcdode479.prod.acquia-sites.com/taxonomy/term/309/mobile-nav
		 */
		this.initialNavMenuId = id;

		// Get mobile menu or section nav data
		if (!this.cgdpMenuData.nav.id) {
			const url = window.location.origin;
			this.cgdpMenuData = await this.fetchFromPath(
				`${url}/taxonomy/term/${this.ncidsNavInfo.nav.id}/${this.ncidsNavInfo.nav.menu_type}`
			);
		}

		const data = await this.createMobileMenuData();
		this.displayedData = await this.convertMenuData(data);
		console.log('displayed data', this.displayedData);

		return this.displayedData;
	}

	/**
	 * @todo
	 * @param path
	 */
	async fetchFromPath(path: string): Promise<DrupalSectionNav> {
		try {
			const res = await this.client.get(path);
			// Axios will throw for anything non-200.
			//const data = this.convertMenuData(res.data);
			const data = res.data;
			console.log('api', data);
			return data;
		} catch (error: unknown) {
			// This conditional will be hit for any status >= 300.
			if (axios.isAxiosError(error) && error.response) {
				throw new Error(
					`Mobile menu unexpected status ${error.response.status} fetching ${path}`
				);
			}
			throw new Error(`Could not fetch mobile menu for ${path}.`);
		}
	}

	/**
	 * @todo jsdoc
	 * @return MobileMenuData object that should display on selection.
	 */
	async createMobileMenuData(): Promise<DrupalMenuItem> {
		console.log('ok but show data for', this.initialNavMenuId);
		console.log('parent', this.parent);

		// tree root, just display that data
		if (this.cgdpMenuData.nav.id === this.initialNavMenuId) {
			console.log('showing data for root');
			this.navTree = this.cgdpMenuData.nav;
			this.parent = null;

			if (this.ncidsNavInfo.nav.menu_type === 'section-nav') {
				this.parent = this.cgdpMenuData.parent_info?.parent_link_item || null;
			} else {
				this.parent = null;
			}

			return this.navTree;
		}

		// check for back, parent item
		if (this.parent && this.parent.id == this.initialNavMenuId) {
			console.log('go back');
			this.navTree = this.parent;

			// todo blame type errors for this mess
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.ncidsNavInfo.nav =
				this.cgdpMenuData.parent_info?.parent_nav || this.ncidsNavInfo.nav;

			const url = window.location.origin;
			const newData = await this.fetchFromPath(
				`${url}/taxonomy/term/${this.ncidsNavInfo.nav.id}/${this.ncidsNavInfo.nav.menu_type}`
			);

			console.log('newData', newData);
			///
			if (newData.nav.children) {
				console.log('new data(newData.nav.children', newData.nav.children);
				const children = newData.nav.children.filter(
					(child: DrupalMenuItem) => {
						if (child.children && child.children.length) {
							const grandchildren = child.children.filter(
								(grandchild: DrupalMenuItem) => {
									return grandchild.id === this.initialNavMenuId;
								}
							);

							if (grandchildren) {
								return grandchildren[0];
							}
						}

						return child.id === this.initialNavMenuId;
					}
				);

				if (children.length) {
					// matching child data found, display that
					console.log('new data children found', children);
					this.parent = children[0];
					return this.navTree;
				}
			}
			///
			this.parent = newData.nav;

			return this.navTree;
		}

		// if the initial id is a child of the current tree, parent should be set to current and current should be set to new
		if (this.navTree.children && this.navTree.children.length) {
			const children = this.navTree.children.filter((child: DrupalMenuItem) => {
				return child.id === this.initialNavMenuId;
			});

			if (children.length) {
				// matching child data found, display that
				this.parent = this.navTree;
				this.navTree = children[0];
				return this.navTree;
			}
		}

		// if the initial id is a child of the current tree, parent should be set to current and current should be set to new
		if (this.cgdpMenuData.nav.children) {
			this.navTree = this.cgdpMenuData.nav;
			const children = this.navTree.children.filter((child: DrupalMenuItem) => {
				return child.id === this.initialNavMenuId;
			});

			if (children.length) {
				// matching child data found, display that
				this.parent = this.navTree;
				this.navTree = children[0];
				return this.navTree;
			}
		}

		console.log('you found another edge case, lucky you');
		return this.navTree;
	}

	/**
	 * @todo
	 * @param drupalMenuItem
	 * @return Converted DrupalMenuItem object to MobileMenuData type.
	 */
	async convertMenuData(
		drupalMenuItem: DrupalMenuItem
	): Promise<MobileMenuData> {
		const hasChildrenItems =
			drupalMenuItem.children && drupalMenuItem.children.length;

		const childrenItems = hasChildrenItems
			? drupalMenuItem.children.map((child: DrupalMenuItem) => {
					return this.convertMenuItem(child);
			  })
			: [];

		return {
			id: drupalMenuItem.id,
			label: drupalMenuItem.label,
			path: drupalMenuItem.path === '/-0' ? '/' : drupalMenuItem.path,
			langcode: drupalMenuItem.langcode,
			hasChildren: !!hasChildrenItems,
			items: childrenItems,
			parent:
				drupalMenuItem.path !== '/' && drupalMenuItem.path !== '/espanol'
					? (this.parent as unknown as MobileMenuItem)
					: null,
		};
	}

	convertMenuItem(drupalMenuItem: DrupalMenuItem): MobileMenuItem {
		const hasChildrenItems =
			drupalMenuItem.children && drupalMenuItem.children.length;

		return {
			id: drupalMenuItem.id,
			label: drupalMenuItem.label,
			path: drupalMenuItem.path === '/-0' ? '/' : drupalMenuItem.path,
			langcode: drupalMenuItem.langcode,
			hasChildren: !!hasChildrenItems,
		};
	}
}

export default CgdpMobileMenuAdaptor;
