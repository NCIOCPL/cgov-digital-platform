import './press-release.scss';
import './press-release-legacy.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';

//DOM Ready event
const onDOMContentLoaded = () => {
	cgdpRelatedResourcesInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
