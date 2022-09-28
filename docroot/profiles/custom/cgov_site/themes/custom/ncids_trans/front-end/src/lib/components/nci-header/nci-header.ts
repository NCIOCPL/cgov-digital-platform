import axios from 'axios';
import { NCIExtendedHeaderWithMegaMenu } from '@nciocpl/ncids-js';
import { CgdpMobileMenuAdaptor } from './cgdp-mobile-menu';
import CgdpMegaMenuAdaptor from './cgdp-mega-menu/cgdp-megamenu-adapter';
import {
	primaryNavLinkClickHandler,
	megaMenuOpenHandler,
	megaMenuLinkClickHandler,
} from './mega-menu-analytics-handlers';

/**
 * Wires up a usa-sidenav for the cdgp requirements.
 */
const initialize = () => {
	const headerEl = document.getElementById('nci-header');
	if (!headerEl) {
		console.error('Cannot find nci header element.');
		return;
	}

	const mobileMenuSource = new CgdpMobileMenuAdaptor(false);

	// This is the client that can be used for both the MobileMenuAdapter and the
	// MegaMenuAdapter.
	const client = axios.create({
		// todo: the baseUrl should be set to the base url of the site.
		// A microsite, or language, under www.cancer.gov would need
		// to have a baseUrl like /nano.
		baseURL: '/',
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
};

export default initialize;
