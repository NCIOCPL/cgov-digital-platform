import './error-page.scss';
import { NCIAutocomplete } from '@nciocpl/ncids-js/nci-autocomplete';
import CgdpAutocompleteAdapter from '../../lib/components/nci-header/cgdp-autocomplete/cgdp-autocomplete-adapter';
import {
	cgdpErrorPageLinkAnalyticsInit,
	cgdpErrorPageSearchAnalyticsInit,
} from './error-page-analytics';

/**
 * Tracks submissions of the 404 search box and wires up the autocomplete.
 * Mirrors nci-header's autocomplete setup for the 404 search box.
 */
const cgdpErrorPageSearchInit = (errorPage: Element): void => {
	const searchForm = errorPage.querySelector(
		'#pageNotFoundSearchForm'
	) as HTMLFormElement | null;
	const searchInput = searchForm?.querySelector(
		'[name="swKeyword"]'
	) as HTMLInputElement | null;

	cgdpErrorPageSearchAnalyticsInit(searchForm, searchInput);

	const collection = searchInput?.dataset.autosuggestCollection;
	const searchApiServer =
		window.CDEConfig?.sitewideSearchConfig?.searchApiServer;

	if (searchInput && collection && searchApiServer) {
		const lang = searchForm?.dataset.language === 'es' ? 'es' : 'en';

		NCIAutocomplete.create(searchInput, {
			autocompleteSource: new CgdpAutocompleteAdapter(
				searchApiServer,
				collection,
				lang
			),
			maxOptionsCount: 10,
			minCharCount: 3,
			minPlaceholderMsg:
				lang === 'en'
					? 'Please enter 3 or more characters'
					: 'Ingrese 3 o más caracteres',
			listboxClasses: 'listboxWidth',
		});
	}
};

//DOM Ready event
const onDOMContentLoaded = () => {
	const errorPage = document.querySelector('.error-page--404');

	if (errorPage) {
		cgdpErrorPageLinkAnalyticsInit(errorPage);
		cgdpErrorPageSearchInit(errorPage);
	}
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
