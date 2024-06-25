import './ncids-mini-landing.scss';

import cgdpLandingRawHtml from '../../lib/components/cgdp-landing-raw-html';
import usaSidenavInit from '../../lib/components/usa-sidenav';
import usaBreadcrumbInit from '../../lib/components/usa-breadcrumb';
import cgdpPageOptionsInit from '../../lib/components/cgdp-page-options';

const onDOMContentLoaded = () => {
	// Init raw html blocks
	cgdpLandingRawHtml();
	// Initialize the Sidenav
	usaSidenavInit();
	// Init Breadcrumbs
	usaBreadcrumbInit();
	// Init the page options
	cgdpPageOptionsInit();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
