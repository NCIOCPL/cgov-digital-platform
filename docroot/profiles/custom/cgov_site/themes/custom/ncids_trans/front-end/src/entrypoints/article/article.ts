import './article.scss';
import './article-legacy.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';

//DOM Ready event
const onDOMContentLoaded = () => {
	cgdpArticleBodyInit();
	cgdpRelatedResourcesInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
