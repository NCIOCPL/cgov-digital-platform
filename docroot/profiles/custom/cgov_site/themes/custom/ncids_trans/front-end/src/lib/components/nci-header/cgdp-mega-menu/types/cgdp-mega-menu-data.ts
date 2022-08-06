import CgdpMegaMenuItemData from './cgdp-mega-menu-item-data';

/**
 * Represents response data from the mega menu API
 */
type CgdpMegaMenuData = {
	primary_nav_label: string;
	primary_nav_url: string;
	items: CgdpMegaMenuItemData[];
};

export default CgdpMegaMenuData;
