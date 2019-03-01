import $ from 'jquery';
/**
 * jQuery XMLHttpRequest object
 * @external jqXHR
 * @see {@link http://api.jquery.com/Types/#jqXHR}
 * @see {@link http://api.jquery.com/jQuery.ajax/#jqXHR}
 */

/**
 * NCI dictionary namespace.
 * @namespace
 */
var dictionary = {
	/**
	 * Enumeration for the available dictionaries.
	 * @readonly
	 * @enum {string}
	 */
	dictionaries: {
		/** NCI Dictionary of Cancer Terms */
		term: 'term',
		'cancer-terms': 'term',
		diccionario: 'term',
		/** NCI Drug Dictionary */
		drug: 'drug',
		'cancer-drug': 'drug',
		/** NCI Dictionary of Genetic Terms */
		genetic: 'genetic',
		'genetics-dictionary': 'genetic'

	},

	/**
	 * Base endpoint for the dictionary webservice.
	 * @readonly
	 */
	endpoint: 'https://www.cancer.gov/Dictionary.Service/v1',

	/**
	 * Performs a search for terms with names that start with or contain certain text.
	 * @param {dictionary.dictionaries} dictionary - The dictionary to use for search and results. Valid values are: 'term', 'drug', 'genetic'.
	 * @param {string} searchText - The text to search for.
	 * @param {string} [language='English'] - The language to use for search and results. Valid values are: 'English', 'Spanish'. For the genetic and drug dictionaries, only 'English' is valid.
	 * @param {string} [searchType='begins'] - What kind of search to perform. Valid values are: 'begins', 'contains'.
	 * @param {number} [offset=0] - Offset into the list of results for the first record to return.
	 * @param {number} [maxResults=0] - The maximum number of results to return. If a value of less than 10 is specified, maxResults is ignored and 10 is used instead.
	 * @return {external:jqXHR} - The jQuery XHR object returned by the AJAX call to the dictionary service.
	 */
	search: function(dictionary, searchText, language, searchType, offset, maxResults) {
		var that = this;

		// validate `dictionary`
		if (!dictionary || // no dictionary specified
			!that.dictionaries[dictionary] // dictionary specified, but not in the allowed list of dictionaries
		) {
			return $.Deferred().reject();
		}

		// validate `searchText`
		if (!searchText) { // no searchText, cannot run an empty search
			return $.Deferred().reject();
		}

		var method = 'search';
		language = language || 'English';
		searchType = searchType || 'begins';
		offset = offset || 0;
		maxResults = maxResults || 0;

		return $.getJSON(that.endpoint + '/' + method, {
			dictionary: that.dictionaries[dictionary],
			searchText: searchText,
			language: language,
			searchType: searchType,
			offset: offset,
			maxResuts: maxResults
		});
	},

	/**
	 * Lightweight method to search for terms matching searchText. This method is intended for use with autosuggest and returns a maximum of 10 results.
	 * @param {dictionary.dictionaries} dictionary - The dictionary to use for search and results. Valid values are: 'term', 'drug', 'genetic'.
	 * @param {string} searchText - The text to search for.
	 * @param {string} [language='English'] - The language to use for search and results. Valid values are: 'English', 'Spanish'. For the genetic and drug dictionaries, only 'English' is valid.
	 * @param {string} [searchType='begins'] - What kind of search to perform. Valid values are: 'begins', 'contains', 'magic'.
	 * @return {external:jqXHR} - The jQuery XHR object returned by the AJAX call to the dictionary service.
	 */
	searchSuggest: function(dictionary, searchText, language, searchType) {
		var that = this;

		// validate `dictionary`
		if (!dictionary || // no dictionary specified
			!that.dictionaries[dictionary] // dictionary specified, but not in the allowed list of dictionaries
		) {
			return $.Deferred().reject();
		}

		// validate `searchText`
		if (!searchText) { // no searchText, cannot run an empty search
			return $.Deferred().reject();
		}

		var method = 'searchSuggest';
		language = language || 'English';
		searchType = searchType || 'begins';

		return $.getJSON(that.endpoint + '/' + method, {
			dictionary: that.dictionaries[dictionary],
			searchText: searchText,
			language: language,
			searchType: searchType
		});
	},

	/**
	 * Performs a search for a single specific term given the term's CDR ID.
	 * @param {dictionary.dictionaries} dictionary - The dictionary to use for search and results. Valid values are: 'term', 'drug', 'genetic'.
	 * @param {string} termID - ID of the term to retrieve.
	 * @param {string} [language='English'] - The language to use for search and results. Valid values are: 'English', 'Spanish'. For the genetic and drug dictionaries, only 'English' is valid.
	 * @return {external:jqXHR} - The jQuery XHR object returned by the AJAX call to the dictionary service.
	 */
	getTerm: function(dictionary, termID, language) {
		var that = this;

		// validate `dictionary`
		if (!dictionary || // no dictionary specified
			!that.dictionaries[dictionary] // dictionary specified, but not in the allowed list of dictionaries
		) {
			return $.Deferred().reject();
		}

		// validate `termID`
		if (!termID) { // no termID, cannot run an empty search
			return $.Deferred().reject();
		}

		var method = 'getTerm';
		language = language || 'English';

		return $.getJSON(that.endpoint + '/' + method, {
			dictionary: that.dictionaries[dictionary],
			termId: termID,
			language: language
		});
	}
};

export default dictionary;
