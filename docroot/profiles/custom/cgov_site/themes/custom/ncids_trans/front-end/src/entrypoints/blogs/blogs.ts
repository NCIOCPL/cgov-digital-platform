import './blogs.scss';
import './blogs-legacy.scss';

import cgdpBlogArchiveInit from '../../lib/components/cgdp-blog-archive';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';

const onDOMContentLoaded = () => {
	cgdpBlogArchiveInit();
	cgdpRelatedResourcesInit();
	cgdpCitationInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
