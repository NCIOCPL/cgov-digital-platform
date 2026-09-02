import './cancer-center.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';
import cgdpProfileBox from '../../lib/components/cgdp-profile-box';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';

import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let cancerCenterBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!cancerCenterBodyAnalyticsInit) {
		const cancerCenterBodySection = document.querySelector(
			'.usa-prose--ncids-full-html'
		);
		const cancerCenterBodyParent = cancerCenterBodySection?.parentElement;

		// Verify both elements exist before running helper
		if (cancerCenterBodySection && cancerCenterBodyParent) {
			// NOTE: There should only ever be one instance of the body section on the
			// page, so we can hardcode the section index to 0
			bodyLinkAnalyticsHelper(cancerCenterBodyParent as HTMLElement, 0);
			cancerCenterBodyAnalyticsInit = true;
		}
	}
};

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpProfileBox();
	cgdpDefinitionInit();
	cgdpBodyAnalyticsInit();
});
