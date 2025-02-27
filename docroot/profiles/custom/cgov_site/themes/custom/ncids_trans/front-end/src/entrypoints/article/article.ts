import './article.scss';
import './article-legacy.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';

document.addEventListener('DOMContentLoaded', () => {
	cgdpArticleBodyInit();
	cgdpRelatedResourcesInit();
});
