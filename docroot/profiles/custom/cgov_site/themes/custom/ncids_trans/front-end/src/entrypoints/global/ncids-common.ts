import './ncids-common.scss';
import './ncids-common-legacy.scss';

import usaBannerInit from '../../lib/components/usa-banner';

//DOM Ready event
const onDOMContentLoaded = () => {
	/* NCIDS Event Handlers will come first. */
	// Initialize the Banner/Language toggle.
	usaBannerInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
