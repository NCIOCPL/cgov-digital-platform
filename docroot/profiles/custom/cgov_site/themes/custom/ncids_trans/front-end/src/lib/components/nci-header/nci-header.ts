import axios from 'axios';
import {
	NCIExtendedHeaderWithMegaMenu,
	NCIAutocomplete,
} from '@nciocpl/ncids-js';
import { CgdpMobileMenuAdaptor } from './cgdp-mobile-menu';
import CgdpMegaMenuAdaptor from './cgdp-mega-menu/cgdp-megamenu-adapter';
import CgdpAutocompleteAdapter from './cgdp-autocomplete/cgdp-autocomplete-adapter';
import {
	primaryNavLinkClickHandler,
	megaMenuOpenHandler,
	megaMenuLinkClickHandler,
} from './mega-menu-analytics-handlers';
import { searchSubmitHandler } from './auto-suggest-analytics-handlers';
declare global {
	interface CDEConfig {
		sitewideSearchConfig: {
			searchApiServer: string;
		};
	}
}

/**
 * Initializes the autocomplete, and someday the search form.
 */
const initializeSearch = () => {
	// TODO: Handle the use case for analytics when there is no autocomplete.

	// So there must be a collection in order to have an autocomplete.
	// There must also be an input too. Good thing they are both handled here.
	const inputEl = document.getElementById(
		'nci-header-search__field'
	) as HTMLInputElement;
	const collection = inputEl?.dataset.autosuggestCollection;

	// No collection is ok, this just means no autocomplete.
	if (!collection) {
		return;
	}

	// There must be an API endpoint for an autocomplete.
	const searchApiServer =
		window.CDEConfig?.sitewideSearchConfig?.searchApiServer;

	if (!searchApiServer) {
		console.error(`CDEConfig searchApiServer must be provided`);
		return;
	}

	// Default to English is somehow we are missing the lang, but we should not.
	const lang =
		document.documentElement.lang === '' ? 'en' : document.documentElement.lang;

	const client = axios.create({
		baseURL: searchApiServer,
		responseType: 'json',
	});

	const ACSource = new CgdpAutocompleteAdapter(client, collection, lang);
	let minPlaceholderMsg = 'Please enter 3 or more characters';
	if (lang !== 'en') {
		minPlaceholderMsg = 'Ingrese 3 o más caracteres';
	}
	NCIAutocomplete.create(inputEl, {
		autocompleteSource: ACSource,
		maxOptionsCount: 10,
		minCharCount: 3,
		// TODO: Translate the placeholder.
		minPlaceholderMsg: minPlaceholderMsg,
		listboxClasses: 'listboxWidth',
	});

	// const acForm = document.getElementsByClassName('nci-header-search');
	// const acFormEl = acForm[0] as HTMLFormElement;
	// TODO: Change this to inputEl when ncids is updated.
	inputEl.addEventListener(
		'nci-autocomplete:formSubmission',
		searchSubmitHandler
	);
};

const initialize = () => {
	const headerEl = document.getElementById('nci-header');
	if (!headerEl) {
		console.error('Cannot find nci header element.');
		return;
	}
	const mobileMenuSource = new CgdpMobileMenuAdaptor();

	// A microsite, or language, under www.cancer.gov would need
	// to have a baseUrl like /nano.
	const baseURL = headerEl.dataset.basePath ?? '/';

	// This is the client that can be used for both the MobileMenuAdapter and the
	// MegaMenuAdapter.
	const client = axios.create({
		baseURL,
		responseType: 'json',
	});

	const megaMenuSource = new CgdpMegaMenuAdaptor(client);

	// NOTE: this is on the document. This is because the nci-header does not
	// care about the contents once it is show. It is completed decoupled.
	// So our mega menu contents need to fire off the event.
	document.addEventListener(
		'nci-header:mega-menu:linkclick',
		megaMenuLinkClickHandler
	);

	headerEl.addEventListener(
		'nci-header:mega-menu:expand',
		(event: Event) => {
			megaMenuOpenHandler(event);
		},
		true
	);
	headerEl.addEventListener(
		'nci-header:primary-nav:linkclick',
		primaryNavLinkClickHandler,
		true
	);

	NCIExtendedHeaderWithMegaMenu.create(headerEl, {
		mobileMenuSource,
		megaMenuSource,
	});

	// The autocomplete for the sitewide search is actually a separate element.
	// At this time the header is not needed.
	initializeSearch();
};

export default initialize;
