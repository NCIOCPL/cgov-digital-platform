import './article.scss';
import './article-legacy.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpOnThisPageInit from '../../lib/components/cgdp-on-this-page';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';

//DOM Ready event
const onDOMContentLoaded = () => {
	cgdpArticleBodyInit();
	cgdpRelatedResourcesInit();
	cgdpOnThisPageInit();
	cgdpCitationInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
