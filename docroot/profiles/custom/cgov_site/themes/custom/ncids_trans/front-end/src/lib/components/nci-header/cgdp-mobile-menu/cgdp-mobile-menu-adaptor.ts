import type { MobileMenuAdaptor, MobileMenuData } from '@nciocpl/ncids-js';

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMobileMenuAdaptor implements MobileMenuAdaptor {
	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId = false;

	// Placeholder
	getInitialMenuId(): Promise<string | number> {
		throw new Error('Method not implemented.');
	}

	//Placeholder
	getNavigationLevel(id: string | number): Promise<MobileMenuData> {
		throw new Error(`Method not implemented. ${id}`);
	}
}

export default CgdpMobileMenuAdaptor;
