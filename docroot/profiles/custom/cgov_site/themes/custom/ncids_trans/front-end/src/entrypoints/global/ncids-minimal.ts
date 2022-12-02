import './ncids-minimal.scss';

// NCIDS Imports
import usaBannerInit from '../../lib/components/usa-banner';
import usaFooterInit from '../../lib/components/usa-footer';
import usaSiteAlertInit from '../../lib/components/usa-site-alert';
import nciHeaderInit from '../../lib/components/nci-header';

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
});
