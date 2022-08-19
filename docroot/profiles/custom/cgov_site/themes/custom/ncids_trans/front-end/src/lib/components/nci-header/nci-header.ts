import { NCIExtendedHeaderWithMegaMenu } from '@nciocpl/ncids-js';
import CgdpMegaMenuAdaptor from './cgdp-megamenu-adapter';
import { CgdpMobileMenuAdaptor } from './cgdp-mobile-menu';
/**
 * Wires up a usa-sidenav for the cdgp requirements.
 */
const initialize = () => {
	const headerEl = document.getElementById('nci-header');
	if (!headerEl) {
		return;
	}
	const megaMenuSource = new CgdpMegaMenuAdaptor();
	const mobileMenuSource = new CgdpMobileMenuAdaptor();

	NCIExtendedHeaderWithMegaMenu.create(headerEl, {
		mobileMenuSource,
		megaMenuSource,
	});
};

export default initialize;
