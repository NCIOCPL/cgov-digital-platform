import './biography.scss';
import './biography-legacy.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpCitationInit();
});
