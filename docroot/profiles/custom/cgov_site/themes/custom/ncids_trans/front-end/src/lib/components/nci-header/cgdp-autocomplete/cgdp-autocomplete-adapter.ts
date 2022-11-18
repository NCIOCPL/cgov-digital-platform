import { Axios } from 'axios';
import { AutocompleteAdaptor } from '@nciocpl/ncids-js';

class CgdpAutocompleteAdapter implements AutocompleteAdaptor {
	/**
	 * Instance of an axios client.
	 */
	client: Axios;
	collection: string;
	lang: string;

	/**
	 * Creates an instance of a Cgdp Auto Complete Adapter
	 * @param {Axios} client an axios client.
	 */
	constructor(client: Axios, collection: string, lang: string) {
		this.client = client;
		this.collection = collection;
		this.lang = lang;
	}

	async getAutocompleteSuggestions(searchText: string): Promise<Array<string>> {
		const path = `/Autosuggest/${this.collection}/${this.lang}/${searchText}`;
		try {
			// The sws autosuggest will always return a results object even if it is an empty array
			const res = await this.client.get(path);
			return res.data.results.map((item: { term: string }) => item.term);
		} catch (error) {
			console.error(`Autosuggest Fetch Error: ${error}`);
			return [];
		}
	}
}

export default CgdpAutocompleteAdapter;
