import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler when searching with the auto complete.
 * @param event
 */
export const searchSubmitHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;

	console.log('detail', detail);

	/*
	 * Selected: options were offered and used
	 * Offered: options were offered but not used
	 * None: no options were offered (less than 3 characters or no options all together)
	 */
	const usage =
		detail.optionsPresented && detail.selectedOptionSetSize
			? detail.selectedOptionValue
				? 'Selected'
				: 'Offered'
			: 'None';

	// todo:
	// detail.selectedOptionSetSize returned 0 for "breast cancer" when nothing selected, always display option size regardless if autocomplete used. why is this called selected anyway
	// selectedOptionIndex returned 0 when nothing selected, send null when selected not used

	trackOther('HeaderSearch:Submit', 'HeaderSearch:Submit', {
		formType: 'SitewideSearch',
		searchTerm: detail.searchText,
		autoSuggestUsage: usage,
		charactersTyped: detail.inputtedTextWhenSelected,
		numCharacters: detail.inputtedTextWhenSelected.length,
		numSuggestsSelected: detail.selectedOptionIndex + 1,
		suggestItems: detail.selectedOptionSetSize,
		suggestOptionValue: detail.selectedOptionValue,
		location: 'Header',
	});
};
