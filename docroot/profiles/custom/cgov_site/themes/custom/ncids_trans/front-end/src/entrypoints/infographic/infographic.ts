import './infographic.scss';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpEmbedVideoInit from '../../lib/components/wysiwyg/common/cgdp-embed-video';
import cgdpEmbedCardInit from '../../lib/components/wysiwyg/common/cgdp-embed-card';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';

import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let infographicBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!infographicBodyAnalyticsInit) {
		const infographicBodySection = document.querySelector(
			'.usa-prose--ncids-full-html'
		);
		const infographicBodyParent = infographicBodySection?.parentElement;

		if (infographicBodySection && infographicBodyParent) {
			bodyLinkAnalyticsHelper(infographicBodyParent as HTMLElement, 0);
			infographicBodyAnalyticsInit = true;
		}
	}
};

document.addEventListener('DOMContentLoaded', () => {
	cgdpInfographicInit();
	cgdpEmbedVideoInit();
	cgdpEmbedCardInit();
	cgdpDefinitionInit();
	cgdpBodyAnalyticsInit();
});
