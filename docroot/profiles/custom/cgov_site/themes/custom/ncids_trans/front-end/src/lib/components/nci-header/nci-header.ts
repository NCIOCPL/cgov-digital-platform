import axios from 'axios';
import { NCIExtendedHeaderWithMegaMenu } from '@nciocpl/ncids-js';
import { CgdpMobileMenuAdaptor } from './cgdp-mobile-menu';
import CgdpMegaMenuAdaptor from './cgdp-mega-menu/cgdp-megamenu-adapter';
import {
	primaryNavLinkClickHandler,
	megaMenuOpenHandler,
	megaMenuLinkClickHandler,
} from './mega-menu-analytics-handlers';
import { DrupalNavApiReference } from './cgdp-mobile-menu/types';

declare global {
	interface Window {
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
 * Wires up a usa-sidenav for the cdgp requirements.
 */
const initialize = () => {
	const headerEl = document.getElementById('nci-header');
	if (!headerEl) {
		console.error('Cannot find nci header element.');
		return;
	}

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

	// We need to get the menu information off the window.
	if (!window.ncidsNavInfo) {
		console.error('Mobile nav information missing on page');
		return;
	}

	// This is a little dicey here as the nav info could be bad.
	// todo: add a bit more checks to make sure the nav info is the right shape.
	const mobileMenuSource = new CgdpMobileMenuAdaptor(
		false,
		client,
		window.ncidsNavInfo?.item_id?.toString(),
		window.ncidsNavInfo.nav,
		// todo: get the language from the <html> element.
		'en'
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

	NCIExtendedHeaderWithMegaMenu.create(headerEl, {
		mobileMenuSource,
		megaMenuSource,
	});
};

export default initialize;
