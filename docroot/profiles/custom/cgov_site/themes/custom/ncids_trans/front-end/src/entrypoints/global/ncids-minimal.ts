import './ncids-minimal.scss';

// NCIDS Imports
import usaBannerInit from '../../lib/components/usa-banner';
import usaFooterInit from '../../lib/components/usa-footer';
import usaSiteAlertInit from '../../lib/components/usa-site-alert';
import nciHeaderInit from '../../lib/components/nci-header';

// Temporarily added here to prevent multiple imports of axios.
// TODO: once axios is made a webpack external, move to home-landing.
import inlineVideoInit from '../../lib/components/cgdp-inline-video';

document.addEventListener('DOMContentLoaded', () => {
	/* NCIDS Event Handlers will come first. */
	// Initialize the Banner/Language toggle.
	usaBannerInit();

	// Init the header.
	nciHeaderInit();

	// Init the footer
	usaFooterInit();

	//Init the site alert
	usaSiteAlertInit();

	// Init InlineVideo here, unfortunately
	inlineVideoInit();
});
