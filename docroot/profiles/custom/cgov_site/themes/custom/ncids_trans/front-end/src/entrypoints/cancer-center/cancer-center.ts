import './cancer-center.scss';
import './cancer-center-legacy.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpEmbedVideoInit();
});
