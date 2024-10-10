import './ncids-mini-landing.scss';

import cgdpLandingRawHtml from '../../lib/components/cgdp-landing-raw-html';
import usaSidenavInit from '../../lib/components/usa-sidenav';
import usaBreadcrumbInit from '../../lib/components/usa-breadcrumb';
import cgdpPageOptionsInit from '../../lib/components/cgdp-page-options';
import cgdpContentBlockInit from '../../lib/components/cgdp-landing-content-block';
import cgdpFeatureCardRow from '../../lib/components/cgdp-feature-card-row';
import cgdpListInit from '../../lib/components/cgdp-list';
import cgdpSummaryBox from '../../lib/components/cgdp-summary-box';
import cgdpFlagCardGroupInit from '../../lib/components/cgdp-flag-card-group';
import cgdpWideGuideCard from '../../lib/components/cgdp-wide-guide-card';

const onDOMContentLoaded = () => {
	// Init feature cards
	cgdpFeatureCardRow();
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
	// Init Lists
	cgdpListInit();
	// Init the summary box
	cgdpSummaryBox();
	// Init Flag Cards
	cgdpFlagCardGroupInit();
	// Init the wide guide card
	cgdpWideGuideCard();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
