import './ncids-mini-landing.scss';

import cgdpLandingRawHtml from '../../lib/components/cgdp-landing-raw-html';
import usaSidenavInit from '../../lib/components/usa-sidenav';
import usaBreadcrumbInit from '../../lib/components/usa-breadcrumb';
import cgdpPageOptionsInit from '../../lib/components/cgdp-page-options';
import cgdpContentBlockInit from '../../lib/components/cgdp-landing-content-block';

const onDOMContentLoaded = () => {
	// Init raw html blocks
	cgdpLandingRawHtml();
	// Initialize the Sidenav
	usaSidenavInit();
	// Init Breadcrumbs
	usaBreadcrumbInit();
	// Init the page options
	cgdpPageOptionsInit();
	// Init the content block
	cgdpContentBlockInit();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
