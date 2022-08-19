import type { MegaMenuAdaptor } from '@nciocpl/ncids-js';

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMegaMenuAdaptor implements MegaMenuAdaptor {
	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId = false;

	async getMegaMenuContent(id: string): Promise<HTMLElement> {
		const megaMenuContent = document.createElement('div');
		megaMenuContent.setAttribute('data-id', id);

		return megaMenuContent;
	}
}

export default CgdpMegaMenuAdaptor;
