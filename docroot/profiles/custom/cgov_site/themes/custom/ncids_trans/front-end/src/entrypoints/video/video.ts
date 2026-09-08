import './video.scss';

import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpVideoInit from '../../lib/components/cgdp-video';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';

import { bodyLinkAnalyticsHelper } from '../../lib/core/analytics/inner-page-analytics-tracker';

let videoBodyAnalyticsInit = false;

const cgdpBodyAnalyticsInit = (): void => {
	if (!videoBodyAnalyticsInit) {
		const videoBodySection = document.querySelector(
			'.usa-prose--ncids-streamlined'
		);
		const videoBodyParent = videoBodySection?.parentElement;

		if (videoBodySection && videoBodyParent) {
			bodyLinkAnalyticsHelper(videoBodyParent as HTMLElement, 0);
			videoBodyAnalyticsInit = true;
		}
	}
};

document.addEventListener('DOMContentLoaded', () => {
	cgdpRelatedResourcesInit();
	cgdpVideoInit();
	cgdpDefinitionInit();
	cgdpBodyAnalyticsInit();
});
