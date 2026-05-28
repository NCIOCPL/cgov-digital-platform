import './press-release.scss';

import cgdpDefinitionInit from '../../lib/components/cgdp-definition';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';

import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let pressReleaseBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!pressReleaseBodyAnalyticsInit) {
		const pressReleaseBodySection = document.querySelector(
			'.usa-prose--ncids-full-html'
		);
		const pressReleaseBodyParent = pressReleaseBodySection?.parentElement;

		// Verify both elements exist before running helper
		if (pressReleaseBodySection && pressReleaseBodyParent) {
			// NOTE: Verify if '0' is correct, or if this index needs to be dynamic
			bodyLinkAnalyticsHelper(pressReleaseBodyParent as HTMLElement, 0);
			pressReleaseBodyAnalyticsInit = true;
		}
	}
};

document.addEventListener('DOMContentLoaded', () => {
	cgdpDefinitionInit(true);
	cgdpRelatedResourcesInit();
	cgdpCitationInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpBodyAnalyticsInit();
});
