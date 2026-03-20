import type { MegaMenuAdapter } from '@nciocpl/ncids-js/nci-header';
import { CgdpMegaMenuData } from './types';
import getCgdpMegaMenu from './components/cgdp-mega-menu';

/**
 * Represents a MegaMenuAdapter for CGDP.
 */
class CgdpMegaMenuAdapter implements MegaMenuAdapter {
	/**
	 * Flag to tell header to use ID for this adapter.
	 */
	useUrlForNavigationId = false;

	/**
	 * Base URL to use for requests (e.g. `/` or `/some/path`).
	 */
	baseUrl: string;

	/**
	 * Cache of fetched and built mega menu contents.
	 */
	private cache: {
		[key: string]: HTMLElement;
	};

	/**
	 * Creates an instance of a Cgdp Mega Menu Adapter
	 * @param baseUrl  Base URL for the Drupal API.
	 */
	constructor(baseUrl: string) {
		this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
		this.cache = {};
	}

	/**
	 * Fetches the mega menu data from the mega menu api.
	 * @param {string} id the id of the mega menu to fetch.
	 */
	private async fetchContent(id: string): Promise<CgdpMegaMenuData> {
		const url = `${this.baseUrl}/taxonomy/term/${id}/mega-menu`;

		const res = await fetch(url, { credentials: 'same-origin' });
		if (!res.ok) {
			throw new Error(
				`Megamenu unexpected status ${res.status} fetching ${id}`
			);
		}

		return (await res.json()) as CgdpMegaMenuData;
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

export default CgdpMegaMenuAdapter;
