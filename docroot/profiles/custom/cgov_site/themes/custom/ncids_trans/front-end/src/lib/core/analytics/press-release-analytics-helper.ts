import { trackOther } from './eddl-util';

const PRESS_RELEASE_CONTACT_EVENT_NAME = 'PressRelease:Contact:LinkClick';
const PRESS_RELEASE_CONTACT_LINK_SELECTOR = '.cgdp-media-contact__info a';

const pressReleaseContactClickHandler = (evt: Event): void => {
	const link = evt.currentTarget as HTMLAnchorElement;

	trackOther(
		PRESS_RELEASE_CONTACT_EVENT_NAME,
		PRESS_RELEASE_CONTACT_EVENT_NAME,
		{
			location: 'Body',
			componentType: 'Contact',
			linkText: link.textContent?.trim() || '_ERROR_',
		}
	);
};

export const pressReleaseAnalyticsHelper = (
	context: ParentNode = document
): void => {
	const contactLinks = Array.from(
		context.querySelectorAll(PRESS_RELEASE_CONTACT_LINK_SELECTOR)
	) as HTMLAnchorElement[];

	contactLinks.forEach((link) => {
		if (link.dataset.pressReleaseContactAnalyticsInit === 'true') {
			return;
		}

		link.dataset.pressReleaseContactAnalyticsInit = 'true';
		link.addEventListener('click', pressReleaseContactClickHandler);
	});
};
