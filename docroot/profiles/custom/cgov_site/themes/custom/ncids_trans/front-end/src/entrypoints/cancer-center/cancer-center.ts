import './cancer-center.scss';
import './cancer-center-legacy.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
});
