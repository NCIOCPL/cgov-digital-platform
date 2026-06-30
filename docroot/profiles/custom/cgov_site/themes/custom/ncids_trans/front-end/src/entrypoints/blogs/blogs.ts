import './blogs.scss';

import cgdpBlogArchiveInit from '../../lib/components/cgdp-blog-archive';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';
import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';
import {
	blogRightRailAnalyticsHelper,
	blogSeriesListAnalyticsHelper,
} from '../../lib/core/analytics/blog-analytics-helper';

let blogsBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!blogsBodyAnalyticsInit) {
		const blogsBodySection = document.querySelector(
			'.usa-prose--ncids-full-html'
		);
		const blogsBodyParent = blogsBodySection?.parentElement;

		// Verify both elements exist before running helper
		if (blogsBodySection && blogsBodyParent) {
			// NOTE: There should only ever be one instance of the
			// body section on the page, so we can hardcode the section index to 0
			bodyLinkAnalyticsHelper(blogsBodyParent as HTMLElement, 0);
			blogsBodyAnalyticsInit = true;
		}
	}
};

const onDOMContentLoaded = () => {
	cgdpBlogArchiveInit();
	cgdpRelatedResourcesInit();
	cgdpCitationInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpDefinitionInit();
	cgdpBodyAnalyticsInit();
	blogSeriesListAnalyticsHelper();
	blogRightRailAnalyticsHelper();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
