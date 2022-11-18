import axios, { Axios } from 'axios';
import type { MegaMenuAdaptor } from '@nciocpl/ncids-js';
import { CgdpMegaMenuData } from './types';
import getCgdpMegaMenu from './components/cgdp-mega-menu';

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMegaMenuAdaptor implements MegaMenuAdaptor {
	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId = false;

	/**
	 * Instance of an axios client.
	 */
	client: Axios;

	/**
	 * Cache of fetched and built mega menu contents.
	 */
	private cache: {
		[key: string]: HTMLElement;
	};

	/**
	 * Creates an instance of a Cgdp Mega Menu Adapter
	 * @param {Axios} client an axios client
	 */
	constructor(client: Axios) {
		this.client = client;
		this.cache = {};
	}

	/**
	 * Fetches the mega menu data from the mega menu api.
	 * @param {string} id the id of the mega menu to fetch.
	 */
	private async fetchContent(id: string): Promise<CgdpMegaMenuData> {
		try {
			const res = await this.client.get(`/taxonomy/term/${id}/mega-menu`);
			// Axios will throw for anything non-200.
			return res.data;
		} catch (error: unknown) {
			// This conditional will be hit for any status >= 300.
			if (axios.isAxiosError(error) && error.response) {
				throw new Error(
					`Megamenu unexpected status ${error.response.status} fetching ${id}`
				);
			}
			throw new Error(`Could not fetch megamenu for ${id}.`);
		}
	}

	/**
	 * Gets the mega menu content.
	 * @param {string} id the id of the nav to fetch.
	 * @returns {Promise<HTMLElement>} The mega menu content to display in the panel.
	 */
	async getMegaMenuContent(id: string): Promise<HTMLElement> {
		// The caching is so that we can use the same event handlers
		// without keeping track of them.
		if (!this.cache[id]) {
			try {
				const mmData = await this.fetchContent(id);
				const renderedMenu = getCgdpMegaMenu(mmData, id);
				this.cache[id] = renderedMenu;
			} catch (error: unknown) {
				// Thanks Typescript -- throws can be any kind, so you must runtime typecheck.
				if (error instanceof Error) {
					console.error(error.message);
				}
				return document.createElement('div');
			}
		}
		return this.cache[id];
	}
}

export default CgdpMegaMenuAdaptor;
