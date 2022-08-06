import CgdpMegaMenuListItemData from './cgdp-mega-menu-list-item-data';

/**
 * Represents a list in a mega menu.
 */
type CgdpMegaMenuListData = {
	/** The type of this mega menu item */
	type: 'list';
	/** The title of this mega menu list */
	title: string;
	/** The url of this mega menu list */
	title_url: string;
	/** The items in this list */
	list_items?: CgdpMegaMenuListItemData[];
};

export default CgdpMegaMenuListData;
