import { AutocompleteAdapter } from '@nciocpl/ncids-js/nci-autocomplete';

class CgdpAutocompleteAdapter implements AutocompleteAdapter {
	/**
	 * The base URL that will be prepended to every request.
	 */
	baseUrl: string;
	collection: string;
	lang: string;

	/**
	 * @param baseUrl    Base URL for the autosuggest API
	 *                   (e.g. "https://webapis.cancer.gov/sitewidesearch/v1/").
	 * @param collection Autosuggest collection name.
	 * @param lang       Language code ("en"/"es").
	 */
	constructor(baseUrl: string, collection: string, lang: string) {
		this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
		this.collection = collection;
		this.lang = lang;
	}

	async getAutocompleteSuggestions(searchText: string): Promise<string[]> {
		const path = `/Autosuggest/${this.collection}/${
			this.lang
		}/${encodeURIComponent(searchText)}`;

		try {
			const res = await fetch(`${this.baseUrl}${path}`);

			if (!res.ok) {
				throw new Error(`Request failed with status code ${res.status}`);
			}

			const data = await res.json();
			// the API always returns a `results` object, even if empty
			return data.results.map((item: { term: string }) => item.term);
		} catch (error) {
			console.error(`Autosuggest Fetch Error: ${error}`);
			return [];
		}
	}
}

export default CgdpAutocompleteAdapter;
