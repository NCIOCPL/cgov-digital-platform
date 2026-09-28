import './infographic.scss';
import cgdpInfographicInit from '../../lib/components/cgdp-infographic';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';

import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let infographicBodyAnalyticsInit = false;

/**
 * Body Analytics
 */
const cgdpBodyAnalyticsInit = (): void => {
	if (!infographicBodyAnalyticsInit) {
		const infographicBodySection = document.querySelector(
			'.usa-prose--ncids-streamlined'
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
	cgdpDefinitionInit();
	cgdpBodyAnalyticsInit();
});
