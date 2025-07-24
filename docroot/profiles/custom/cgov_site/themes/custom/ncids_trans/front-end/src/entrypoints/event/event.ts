import './event.scss';
import './event-legacy.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpEmbedVideoInit();
});
