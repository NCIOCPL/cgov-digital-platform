import './event.scss';

import cgdpDefinitionInit from '../../lib/components/cgdp-definition';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';
import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let eventsBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!eventsBodyAnalyticsInit) {
		const eventsBodySection = document.querySelector(
			'.usa-prose--ncids-full-html'
		);
		const eventsBodyParent = eventsBodySection?.parentElement;

		// Verify both elements exist before running helper
		if (eventsBodySection && eventsBodyParent) {
			// NOTE: There should only ever be one instance of the
			// body section on the page, so we can hardcode the section index to 0
			bodyLinkAnalyticsHelper(eventsBodyParent as HTMLElement, 0);
			eventsBodyAnalyticsInit = true;
		}
	}
};

document.addEventListener('DOMContentLoaded', () => {
	cgdpDefinitionInit(true);
	cgdpRelatedResourcesInit();
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpBodyAnalyticsInit();
});
