import './article.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpOnThisPageInit from '../../lib/components/cgdp-on-this-page';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';

import cgdpWysiwygTableInit from '../../lib/components/wysiwyg/common/cgdp-wysiwyg-table';

//DOM Ready event
const onDOMContentLoaded = () => {
	cgdpArticleBodyInit();
	cgdpRelatedResourcesInit();
	cgdpOnThisPageInit();
	cgdpCitationInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpWysiwygTableInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
