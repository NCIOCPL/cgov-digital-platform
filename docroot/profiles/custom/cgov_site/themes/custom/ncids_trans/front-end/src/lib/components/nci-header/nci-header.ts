import axios from 'axios';
import { NCIExtendedHeaderWithMegaMenu } from '@nciocpl/ncids-js/nci-header';
import { NCIAutocomplete } from '@nciocpl/ncids-js/nci-autocomplete';
import { CgdpMobileMenuAdapter } from './cgdp-mobile-menu';
import CgdpMegaMenuAdapter from './cgdp-mega-menu/cgdp-megamenu-adapter';
import CgdpAutocompleteAdapter from './cgdp-autocomplete/cgdp-autocomplete-adapter';
import { DrupalNavApiReference } from './cgdp-mobile-menu/types';

import {
	primaryNavLinkClickHandler,
	megaMenuOpenHandler,
	megaMenuLinkClickHandler,
	logoClickHandler,
} from './mega-menu-analytics-handlers';
import { searchSubmitHandler } from './auto-suggest-analytics-handlers';
import {
	mobileMenuCloseHandler,
	mobileMenuLinkClickHandler,
	mobileMenuOpenHandler,
} from './mobile-menu-analytics-handlers';

declare global {
	interface CDEConfig {
		sitewideSearchConfig?: {
			searchApiServer: string;
		};
	}
}

declare global {
	interface Window {
		/** The instance of the CDE config object. */
		CDEConfig: CDEConfig;
		/** Defines the mobile navigation information for the current page. */
		ncidsNavInfo: {
			/** The navigation to display */
			nav: DrupalNavApiReference;
			/** The selected menu item in the nav menu */
			item_id: string | number;
		};
	}
}

/**
 * Initializes the autocomplete, and someday the search form.
 */
const initializeSearch = (lang: 'en' | 'es') => {
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
		minPlaceholderMsg: minPlaceholderMsg,
		listboxClasses: 'listboxWidth',
	});

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

	// Default to English is somehow we are missing the lang, but we should not.
	// Note we only support en or es. If a page is in de, then it will use en.
	const lang: 'en' | 'es' = (
		document.documentElement.lang === 'es' ? 'es' : 'en'
	) as 'en' | 'es';

	// A microsite, or language, under www.cancer.gov would need
	// to have a baseUrl like /nano.
	const baseURL = headerEl.dataset.basePath ?? '/';

	// This is the client that can be used for both the MobileMenuAdapter and the
	// MegaMenuAdapter.
	const client = axios.create({
		baseURL,
		responseType: 'json',
	});

	const megaMenuSource = new CgdpMegaMenuAdapter(client);

	// We need to get the menu information off the window.
	if (!window.ncidsNavInfo) {
		console.error('Mobile nav information missing on page');
		return;
	}

	// This is a little dicey here as the nav info could be bad.
	// todo: add a bit more checks to make sure the nav info is the right shape.
	const mobileMenuSource = new CgdpMobileMenuAdapter(
		false,
		client,
		window.ncidsNavInfo?.item_id?.toString(),
		window.ncidsNavInfo.nav,
		lang,
		baseURL
	);

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
	headerEl.addEventListener(
		'nci-header:mobile-menu:open',
		mobileMenuOpenHandler,
		true
	);
	headerEl.addEventListener(
		'nci-header:mobile-menu:close',
		mobileMenuCloseHandler,
		true
	);
	headerEl.addEventListener(
		'nci-header:mobile-menu:linkclick',
		mobileMenuLinkClickHandler,
		true
	);

	NCIExtendedHeaderWithMegaMenu.create(headerEl, {
		mobileMenuSource,
		megaMenuSource,
	});

	const logo = document.getElementById('extended-mega-logo');
	// Can add similar if statement as seen on line 99 if needed.
	logo?.addEventListener('click', logoClickHandler, true);

	// The autocomplete for the sitewide search is actually a separate element.
	// At this time the header is not needed.
	initializeSearch(lang);
};

export default initialize;
