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
	parent_info: DrupalParentInfo;
};

/**
 * @todo jsdoc
 */
type NCIDSNavInfo = {
	id: string | number;
	menu_type: string; // todo can ts convert to menuType?
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
	 * Data menu id - requested id of data to display.
	 * @protected
	 */
	protected initialNavMenuId?: string | number;

	/**
	 * Fetched menu data from api, converted to required type for adaptor.
	 * @protected
	 */
	protected cgdpMenuData: MobileMenuData = {
		id: '',
		label: '',
		path: '',
		langcode: '',
		hasChildren: false,
		items: [],
		parent: null,
	};

	/**
	 * Fetched parent data from api.
	 * @protected
	 */
	protected parentNav?: NCIDSNavInfo;

	/**
	 * `.usa-sidenav` element if one is found; does not exist on home and landing pages
	 * @protected
	 */
	protected sidenav: HTMLElement | null;

	/**
	 * @Bryan this is your tree.
	 * @todo jsdoc
	 */
	currentNav?: MobileMenuData;

	/**
	 * @todo jsdoc
	 * @todo wouldn't it be nice if MobileMenuData was just a MobileMenuItem[] in the package?
	 */
	currentNavParent: null | MobileMenuItem | MobileMenuData = null;

	/**
	 * Initial nav info, on default is atttached to html_head.
	 * @see ncids_trans_page_attachments_alter()
	 */
	ncidsNavInfo: NCIDSNavInfo;

	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId: boolean;

	constructor(useUrlForNavigationId: boolean) {
		this.useUrlForNavigationId = useUrlForNavigationId;
		this.ncidsNavInfo = window.ncidsNavInfo;
		this.sidenav = document.querySelector(
			'.usa-sidenav [aria-current=page][data-menu-id]'
		);
	}

	/**
	 * @todo jsdoc
	 * @return Returned ID should be the nav id that we want to display.
	 */
	async getInitialMenuId(): Promise<string | number> {
		return this.sidenav
			? this.sidenav.getAttribute('data-menu-id') || this.ncidsNavInfo?.id
			: this.ncidsNavInfo?.id;
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
		if (!id) {
			throw new Error('Could not find `id`');
		}
		this.initialNavMenuId = id;

		// Get mobile menu or section nav data
		if (!this.cgdpMenuData.id) {
			const url = window.location.origin;
			this.cgdpMenuData = await this.fetchFromPath(
				`${url}/taxonomy/term/${this.ncidsNavInfo.id}/${this.ncidsNavInfo.menu_type}`
			);
		}

		return this.createMobileMenuData();
	}

	/**
	 * @todo
	 * @param path
	 */
	async fetchFromPath(path: string): Promise<MobileMenuData> {
		// todo use axios instead? https://stackoverflow.com/a/67560073/1389807
		return fetch(path)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				return response.json();
			})
			.then((menuItem: DrupalSectionNav) => {
				console.log('api', menuItem);
				this.convertParentItem(menuItem.parent_info);
				return this.convertMenuData(menuItem.nav);
			});
	}

	/**
	 * @todo jsdoc
	 * @return MobileMenuData object that should display on selection.
	 */
	async createMobileMenuData(): Promise<MobileMenuData> {
		console.log('ok but show data for', this.initialNavMenuId);

		// Return parent when user clicks back
		// Note: back should always have the same id as parent
		// todo raising an event would have been much better
		if (this.currentNav?.parent?.id === this.initialNavMenuId) {
			this.currentNav =
				(this.currentNav?.parent as MobileMenuData) || this.cgdpMenuData;
			this.currentNavParent =
				(this.currentNav?.parent as MobileMenuData) || null;

			console.log('go back currentNav', this.currentNav);
			console.log('go back currentNavParent', this.currentNavParent);
			console.log('go back this.parentNav ', this.parentNav);
			console.log('go back ncidsNavInfo', this.ncidsNavInfo);

			// If there are parent with items already, just show that.
			if (this.currentNav.items && this.currentNav.items.length) {
				console.log('has items');
				return this.currentNav as MobileMenuData;
			}

			// If there is a parent nav item (home does not have one), and it does not match our original fetch parent, fetch data again.
			if (this.parentNav !== this.ncidsNavInfo) {
				console.log('fetch new');

				this.ncidsNavInfo = this.parentNav || this.ncidsNavInfo;

				// todo this is duped
				const url = window.location.origin;
				this.cgdpMenuData = await this.fetchFromPath(
					`${url}/taxonomy/term/${this.ncidsNavInfo.id}/${this.ncidsNavInfo.menu_type}`
				);

				console.log('new data', this.cgdpMenuData);
				this.currentNav = this.cgdpMenuData;
			}
		}

		// mobile nav or child of mobile nav
		if (this.ncidsNavInfo.menu_type === 'mobile-nav') {
			return this.displayMobileNavChild();
		}

		// section nav or child of section nav
		if (this.ncidsNavInfo.menu_type === 'section-nav') {
			return this.displaySectionNavChild();
		}

		console.log('displayed data', this.cgdpMenuData);
		return this.cgdpMenuData;
	}

	/**
	 * @todo
	 * @param drupalMenuItem
	 */
	convertParentItem(drupalMenuItem: DrupalParentInfo) {
		const hasChildren = !!(
			drupalMenuItem.parent_link_item &&
			drupalMenuItem.parent_link_item.children.length
		);

		this.currentNavParent =
			drupalMenuItem && drupalMenuItem.parent_nav
				? {
						id: drupalMenuItem.parent_link_item.id,
						label: drupalMenuItem.parent_link_item.label,
						path:
							drupalMenuItem.parent_link_item.path === '/-0'
								? '/'
								: drupalMenuItem.parent_link_item.path,
						langcode: drupalMenuItem.parent_link_item.langcode,
						hasChildren: hasChildren,
						items: hasChildren ? drupalMenuItem.parent_link_item.children : [],
				  }
				: null;

		this.parentNav =
			drupalMenuItem && drupalMenuItem.parent_nav
				? drupalMenuItem.parent_nav
				: undefined;
	}

	/**
	 * @todo
	 * @param drupalMenuItem
	 * @return Converted DrupalMenuItem object to MobileMenuData type.
	 */
	convertMenuData(drupalMenuItem: DrupalMenuItem): MobileMenuData {
		const childrenItems =
			drupalMenuItem.children && drupalMenuItem.children.length
				? drupalMenuItem.children.map((child: DrupalMenuItem) =>
						this.convertMenuData(child)
				  )
				: [];

		return {
			id: drupalMenuItem.id,
			label: drupalMenuItem.label,
			path: drupalMenuItem.path === '/-0' ? '/' : drupalMenuItem.path,
			langcode: drupalMenuItem.langcode,
			hasChildren: !!(childrenItems && childrenItems.length),
			items: childrenItems,
			parent: this.currentNavParent,
		};
	}

	/**
	 * @todo
	 */
	displayMobileNavChild(): MobileMenuData {
		console.log('is mobile nav', this.currentNav);
		this.currentNav = this.currentNav || this.cgdpMenuData;

		const children = this.currentNav.items.filter((child) => {
			return child.id === this.initialNavMenuId;
		});

		console.log('children', children);

		if (children && children.length) {
			const matched = children[0] as MobileMenuData;

			this.currentNavParent =
				matched.parent || this.currentNav || this.cgdpMenuData;

			this.currentNav = {
				hasChildren: matched.hasChildren,
				id: matched.id,
				items: matched.items,
				label: matched.label,
				langcode: matched.langcode,
				parent: this.currentNavParent,
				path: matched.path,
			};
		} else {
			const matchedPath = this.currentNav.items.filter((child) => {
				// Direct descendents of mobile nav on load will return mobile-nav, and there is so sidenav to read for an initial id.
				return child.path === window.location.pathname;
			});

			// try again but with path for nested non roots without sidenavs for initial id
			console.log('found from path', matchedPath);
			if (matchedPath && matchedPath.length && !this.sidenav) {
				const matched = matchedPath[0] as MobileMenuData;
				this.currentNavParent = this.cgdpMenuData;
				this.currentNav = {
					hasChildren: matched.hasChildren,
					id: matched.id,
					items: matched.items,
					label: matched.label,
					langcode: matched.langcode,
					parent: this.currentNavParent,
					path: matched.path,
				};
			} else {
				// display mobile nav
				this.currentNavParent = null;
				this.currentNav = this.cgdpMenuData;
			}
		}

		console.log('displayed data', this.currentNav);
		return this.currentNav;
	}

	/**
	 * @todo
	 */
	displaySectionNavChild(): MobileMenuData {
		console.log('is section nav');
		this.currentNav = this.currentNav || this.cgdpMenuData;

		// todo fix all this junk up
		const id = this.initialNavMenuId;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const children = this.currentNav.items.filter(function f(child) {
			if (child.id === id) return true;

			if (child.hasChildren) {
				return ((child as MobileMenuData).items = (
					child as MobileMenuData
				).items.filter(f)).length;
			}
		});

		console.log('children', children);

		if (children && children.length) {
			const matched = children[0] as MobileMenuData;

			this.currentNavParent = this.currentNav || this.cgdpMenuData; // what

			this.currentNav = {
				hasChildren: matched.hasChildren,
				id: matched.id,
				items: matched.items,
				label: matched.label,
				langcode: matched.langcode,
				parent: this.currentNavParent,
				path: matched.path,
			};
		} else {
			console.log('else');
			this.currentNavParent = this.cgdpMenuData;
			this.currentNav = this.cgdpMenuData;
		}

		console.log('displayed data', this.currentNav);
		return this.currentNav;
	}
}

export default CgdpMobileMenuAdaptor;
