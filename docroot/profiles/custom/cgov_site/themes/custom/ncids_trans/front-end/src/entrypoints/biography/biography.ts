import './biography.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';
import cgdpProfileBox from '../../lib/components/cgdp-profile-box';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';

import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let biographyBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!biographyBodyAnalyticsInit) {
		const biographyBodySection = document.querySelector(
			'.usa-prose--ncids-full-html'
		);
		const biographyBodyParent = biographyBodySection?.parentElement;

		// Verify both elements exist before running helper
		if (biographyBodySection && biographyBodyParent) {
			// NOTE: There should only ever be one instance of the body section on the
			// page, so we can hardcode the section index to 0
			bodyLinkAnalyticsHelper(biographyBodyParent as HTMLElement, 0);
			biographyBodyAnalyticsInit = true;
		}
	}
};

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpCitationInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpProfileBox();
	cgdpDefinitionInit();
	cgdpBodyAnalyticsInit();
});
