import './article.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpOnThisPageInit from '../../lib/components/cgdp-on-this-page';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';
import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';
import cgdpWysiwygTableInit from '../../lib/components/wysiwyg/common/cgdp-wysiwyg-table';

let introTextLinkTrackingHasInit = false;

const cgdpIntroTextInit = () => {
	/**
	 * Intro Text Link Analytics
	 */
	if (introTextLinkTrackingHasInit == false) {
		const articleBodySections = document.querySelectorAll(
			'.cgdp-field-intro-text'
		) as NodeListOf<HTMLElement>;
		if (articleBodySections) {
			articleBodySections.forEach((sections, index) => {
				const articleBody = sections as HTMLElement;
				bodyLinkAnalyticsHelper(articleBody, index, '.usa-prose');
			});
			introTextLinkTrackingHasInit = true;
		}
	}
};

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
	cgdpDefinitionInit(true);
	cgdpIntroTextInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
