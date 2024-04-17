import axios, { Axios } from 'axios';
import type {
	MobileMenuAdapter,
	MobileMenuData,
	MobileMenuItem,
} from '@nciocpl/ncids-js/nci-header';
import type {
	AdapterTreeItem,
	DrupalNavApiResponse,
	DrupalNavApiNavItem,
	DrupalNavApiReference,
} from './types';

/**
 * This is a helper constant to handle the strings for the back button.
 */
const locale: { [resname: string]: { en: string; es: string } } = {
	main_menu: {
		en: 'Main Menu',
		es: 'Menú principal',
	},
	back: {
		en: 'Back',
		es: 'Anterior',
	},
};

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMobileMenuAdapter implements MobileMenuAdapter {
	/**
	 * Instance of an axios client.
	 */
	protected client: Axios;

	/**
	 * The menu item id of the current page's nav.
	 */
	protected initialItemId: string;

	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId: boolean;

	/**
	 * The information about the next menu to fetch.
	 */
	protected nextMenuToFetch: DrupalNavApiReference | null;

	/**
	 * This is the parent item for the current root.
	 */
	protected rootParentItem: AdapterTreeItem | null = null;

	/**
	 * When we fetch a parent nav, we need to replace the navTree
	 * with the new root, and then add the current root as a child
	 * to the node with the ID of parentNavConnectionId
	 * If this is null, then the fetched root should just be set to
	 * the navTree root.
	 */
	protected parentNavConnectionId: string | null = null;

	/**
	 * This is the root of the current cached navigation. This will keep being
	 * updated as we fetch more menus.
	 */
	protected navTree: AdapterTreeItem | null = null;

	/**
	 * This is the language code of the current page.
	 *
	 * Yes, I know that each term has a langcode. However, that is based on
	 * what a user might have selected. So you can probably find a Spanish
	 * term that has an English langcode. So it will be the header's init
	 * functions job to pass in the language.
	 */
	protected langcode: 'en' | 'es' = 'en';

	/**
	 * This is the base url of the current page
	 */
	protected baseURL: string;

	/**
	 * @jsdoc
	 * @param {boolean} useUrlForNavigationId this param is stupid.
	 * @param {Axios} client an axios client
	 * @param {string} initialItemId the initial menu id
	 * @param {DrupalNavApiReference} initialNavRef information about the initial nav
	 * @param {'en'|'es'} langcode the language code of the current page.
	 * @param {string} baseURL the base url of the current page
	 */
	constructor(
		useUrlForNavigationId: boolean,
		client: Axios,
		initialItemId: string,
		initialNavRef: DrupalNavApiReference,
		langcode: 'en' | 'es',
		baseURL: string
	) {
		this.useUrlForNavigationId = useUrlForNavigationId;
		this.client = client;

		// The header initializer should be the one to look at the window object.
		// This class should not know the dom exists at all.
		// Add @see ncids_trans_page_attachments_alter() to ncidsheader
		this.initialItemId = initialItemId;
		this.nextMenuToFetch = initialNavRef;

		this.langcode = langcode;
		this.baseURL = baseURL;
	}

	/**
	 * @todo jsdoc
	 * @return Returned ID should be the nav id that we want to display.
	 */
	async getInitialMenuId(): Promise<string | number> {
		return this.initialItemId;
	}

	/**
	 * @todo jsdoc
	 * @param id
	 * @return Promise of MobileMenuData object that should display on selection.
	 */
	async getNavigationLevel(id: string | number): Promise<MobileMenuData> {
		// Tries to get the node.
		let currNode = this.findNodeInTree(id.toString());

		if (currNode === null) {
			// We need moar tree.
			await this.getMoarTree();
			currNode = this.findNodeInTree(id.toString());
			if (currNode === null) {
				// This should only happen if the Nav API is broken.
				throw new Error(`Section ${id} cannot be found in the navigation.`);
			}
		}

		// Get the child menu items
		const items: MobileMenuItem[] = currNode.children.map((n) => ({
			id: n.id,
			label: n.label,
			path: n.path,
			langcode: n.langcode,
			hasChildren: n.children.length > 0,
		}));

		const rtnNode = {
			id: currNode.id,
			label:
				this.langcode === 'en' ? `Explore ${currNode.label}` : currNode.label,
			path: currNode.path,
			langcode: currNode.langcode,
			hasChildren: items.length > 0,
			items,
			parent: this.getParentMenuItem(currNode),
		};

		return rtnNode;
	}

	/**
	 * Helper function to sort out what the parent menu item is.
	 *
	 * There were too many ternary operators and prettier could not handle it.
	 * @param {AdapterTreeItem} term the term to get the parent of.
	 * @returns the parent menu item or null.
	 */
	private getParentMenuItem(term: AdapterTreeItem): MobileMenuItem | null {
		// Get the parent item.
		const parentNode =
			term.parentId === null
				? this.rootParentItem
				: this.findNodeInTree(term.parentId);

		if (parentNode === null) {
			return null;
		}

		const rootId = (this.navTree as AdapterTreeItem)['id'];
		const label =
			(this.nextMenuToFetch === null && parentNode.id === rootId) ||
			(this.baseURL === parentNode.path &&
				this.nextMenuToFetch?.id === parentNode.id)
				? locale['main_menu'][this.langcode]
				: locale['back'][this.langcode];

		const parentMenuItem: MobileMenuItem = {
			id: parentNode.id,
			label,
			path: parentNode.path,
			langcode: parentNode.langcode,
			hasChildren: parentNode.children.length > 0,
		};

		return parentMenuItem;
	}

	/**
	 * Gets a node in the current nav tree.
	 * @param {string} id the id of the node to find.
	 */
	private findNodeInTree(id: string): AdapterTreeItem | null {
		// There is no navtree, so the node is obviously not in it.
		if (this.navTree === null) {
			return null;
		}

		return this.findNodeInNode(id, this.navTree);
	}

	/**
	 * Recursive method to find a node in a node.
	 *
	 * This will check the passed in node, and its children.
	 *
	 * @param id the id of the node to find.
	 * @param node the id we want to find it within.
	 * @returns the node if found
	 */
	private findNodeInNode(
		id: string,
		node: AdapterTreeItem
	): AdapterTreeItem | null {
		if (id === node.id) {
			return node;
		}

		for (const child of node.children) {
			const foundNode = this.findNodeInNode(id, child);
			if (foundNode !== null) {
				return foundNode;
			}
		}

		return null;
	}

	/**
	 * Helper method to fetch the next parent menu.
	 */
	private async getMoarTree() {
		// If there is no more nav to fetch, then bail.
		if (this.nextMenuToFetch === null) {
			return;
		}

		// This will not be null. An error should be thrown if it is null.
		const navRes = await this.fetchNav(this.nextMenuToFetch);

		// 1. Make new tree. (The root never has a parent id)
		const newRoot = this.drupalItemToAdapterItem(navRes.nav, null);

		if (this.navTree === null) {
			// First time loading.
			this.navTree = newRoot;
		} else {
			this.replaceNavTree(newRoot);
		}

		// 2. Handle parent info.
		if (Array.isArray(navRes.parent_info)) {
			// If parent_info is an empty array then there is no parent.
			// a. Set nextMenuToFetch
			this.nextMenuToFetch = null;
			// b. Set rootParentItem
			this.rootParentItem = null;
			// c. Set the closest_id_in_parent
			this.parentNavConnectionId = null;
		} else {
			// a. Set nextMenuToFetch
			this.nextMenuToFetch = navRes.parent_info.parent_nav;
			// b. Set rootParentItem. (Luckily it has the same shape as an item)
			this.rootParentItem = this.drupalItemToAdapterItem(
				navRes.parent_info.parent_link_item,
				null
			);
			// c. Set the closest_id_in_parent
			this.parentNavConnectionId = navRes.parent_info.closest_id_in_parent;
		}
	}

	/**
	 * This replaces the root node in navTree, and hooks up the old navTree in the correct location.
	 * @param {AdapterTreeItem} newRoot the new root.
	 */
	private replaceNavTree(newRoot: AdapterTreeItem) {
		// This should not happen, but typescript is going to make me check it.
		if (this.parentNavConnectionId === null) {
			throw new Error(
				`mobile adapter encountered issue fetching more menus without a connection point.`
			);
		}

		// Swap out the navTree
		const oldRoot = this.navTree as AdapterTreeItem;
		this.navTree = newRoot;

		// Find the connection node.
		const connectionNode = this.findNodeInNode(
			this.parentNavConnectionId,
			newRoot
		);
		if (connectionNode === null) {
			throw new Error(
				`mobile menu adapter could not find node ${this.parentNavConnectionId} to merge menus`
			);
		}

		// We need to hook up the node now.
		if (this.parentNavConnectionId === oldRoot.id) {
			// The tree is going to replace an item, so we actually need to find
			// the parent of parentNavConnectionId.

			// This should not happen, but typescript is going to make me check it.
			if (connectionNode.parentId === null) {
				throw new Error(
					`mobile adapter encountered issue fetching the parent of the connection node ${connectionNode.id}. Parent id is null.`
				);
			}

			const parentOfConnection = this.findNodeInNode(
				connectionNode.parentId,
				newRoot
			);
			if (parentOfConnection === null) {
				throw new Error(
					`mobile menu adapter could not find (parent) node ${connectionNode.parentId} to merge menus`
				);
			}

			this.addOrReplaceChildNode(parentOfConnection, oldRoot);
		} else {
			// The tree does not replace an existing one.
			this.addOrReplaceChildNode(connectionNode, oldRoot);
		}
	}

	/**
	 * This will either add the oldRoot as a new child, or replace the existing id.
	 *
	 * @param {AdapterTreeItem} newParent the new root to add the node to.
	 * @param {AdapterTreeItem} node the old tree to slip in.
	 */
	private addOrReplaceChildNode(
		newParent: AdapterTreeItem,
		node: AdapterTreeItem
	) {
		const childIdx = newParent.children.findIndex((c) => c.id === node.id);
		node.parentId = newParent.id;
		if (childIdx > -1) {
			newParent.children[childIdx] = node;
		} else {
			newParent.children.push(node);
		}
	}

	/**
	 * Converts a Drupal Nav API Item to this Adapters format.
	 *
	 * This will recurse and convert any child items as well.
	 * @param {DrupalNavApiNavItem} navItem the nav item to convert.
	 * @param {string} parentId the parent identifier of this item.
	 * @returns {AdapterTreeItem} the new node.
	 */
	protected drupalItemToAdapterItem(
		navItem: DrupalNavApiNavItem,
		parentId: string | null
	): AdapterTreeItem {
		// Map the children. We do need to sort by weight first.
		const children = navItem.children
			.sort((a, b) => {
				const aWeight = isNaN(parseInt(a.weight)) ? 0 : parseInt(a.weight);
				const bWeight = isNaN(parseInt(b.weight)) ? 0 : parseInt(b.weight);

				if (aWeight === bWeight) {
					return 0;
				} else if (aWeight < bWeight) {
					return -1;
				} else {
					return 1;
				}
			})
			.map((n) => this.drupalItemToAdapterItem(n, navItem.id));

		return {
			id: navItem.id,
			parentId,
			label: navItem.label,
			path: navItem.path,
			langcode: navItem.langcode,
			children: children,
		};
	}

	/**
	 * This fetches a nav item from the api.
	 * @param {DrupalNavApiReference} navInfo the information of the nav to fetch.
	 */
	private async fetchNav(
		navInfo: DrupalNavApiReference
	): Promise<DrupalNavApiResponse> {
		try {
			const res = await this.client.get(
				`/taxonomy/term/${navInfo.id}/${navInfo.menu_type}`
			);

			// Axios will throw for anything non-200.
			// todo: Account for the API possibly returning {} as the data. In this case it should be
			// an error.
			const data = res.data;
			return data;
		} catch (error: unknown) {
			// This conditional will be hit for any status >= 300.
			if (axios.isAxiosError(error) && error.response) {
				throw new Error(
					`Mobile menu unexpected status ${error.response.status} fetching ${navInfo.id}/${navInfo.menu_type}`
				);
			}
			throw new Error(
				`Could not fetch mobile menu for ${navInfo.id}/${navInfo.menu_type}.`
			);
		}
	}
}

export default CgdpMobileMenuAdapter;
