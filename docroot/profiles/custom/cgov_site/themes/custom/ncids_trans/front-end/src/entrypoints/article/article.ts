import './article.scss';
import './article-legacy.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpOnThisPageInit from '../../lib/components/cgdp-on-this-page';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';

//DOM Ready event
const onDOMContentLoaded = () => {
	cgdpArticleBodyInit();
	cgdpRelatedResourcesInit();
	cgdpOnThisPageInit();
	cgdpCitationInit();
	cgdpInfographicInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
