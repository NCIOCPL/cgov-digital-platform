import './article.scss';
import './article-legacy.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpOnThisPageInit from '../../lib/components/cgdp-on-this-page';

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpOnThisPageInit();
});
