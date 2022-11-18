import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler for clicking on a link within the mega menu
 * @param event
 */
export const searchSubmitHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;
	trackOther('HeaderSearch:Submit', 'HeaderSearch:Submit', {
		formType: 'SitewideSearch',
		searchTerm: detail.searchText,
		autoSuggestUsage: detail.optionsPresented,
		charactersTyped: detail.inputtedTextWhenSelected,
		numCharacters: 3,
		numSuggestsSelected: detail.selectedOptionIndex,
		suggestItems: detail.selectedOptionSetSize,
		suggestOptionValue: detail.selectedOptionValue,
		location: 'Header',
	});
};
