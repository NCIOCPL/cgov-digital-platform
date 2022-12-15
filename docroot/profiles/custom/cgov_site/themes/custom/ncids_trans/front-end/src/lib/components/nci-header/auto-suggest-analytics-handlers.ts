import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler when searching with the auto complete.
 * @param event
 */
export const searchSubmitHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;

	/*
	 * Selected: options were offered and used
	 * Offered: options were offered but not used
	 * None: no options were offered (less than 3 characters or no options all together)
	 */
	const usage = detail.optionsPresented
		? detail.selectedOptionValue
			? 'Selected'
			: 'Offered'
		: 'None';

	// Increase index by one for analytics requirements
	const numberSuggests =
		detail.selectedOptionIndex === null ? null : detail.selectedOptionIndex + 1;

	trackOther('HeaderSearch:Submit', 'HeaderSearch:Submit', {
		formType: 'SitewideSearch',
		/** The term entered for search. */
		searchTerm: detail.searchText,
		/** Selected, Offered, or None */
		autoSuggestUsage: usage,
		/**
		 * What the user typed in before selecting an autosuggest option.
		 * null if no option is selected
		 */
		charactersTyped: detail.inputtedTextWhenSelected || null,
		/**
		 * Number of characters typed before selecting an autosuggest option.
		 * null if no option is selected
		 */
		numCharacters: detail.inputtedTextWhenSelected.length || null,
		/**
		 * Index of the autosuggest option clicked on.
		 * @note null if no option is selected
		 */
		numSuggestsSelected: numberSuggests,
		/** Number of autosuggest items shown. */
		suggestItems: detail.optionSetSize || 0,
		location: 'Header',
	});
};
