import { trackOther } from '../../core/analytics/eddl-util';
import { getPageInfo } from '../../core/analytics/landing-page-contents-helper';

/**
 * Click handler for the language toggle click.
 * @param linkArray the array of interactable OTP elements
 */
const otpLinkClickHandler = (linkArray: HTMLElement[]) => (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;

	// Get the title of the article page
	const pageTitle = target.closest('article')?.querySelector('h1')?.textContent;

	// Get the Page Info
	const { pageType, pageTemplate } = getPageInfo();

	trackOther('Inner:OnThisPage:LinkClick', 'Inner:OnThisPage:LinkClick', {
		location: 'Body',
		componentType: 'On This Page',
		linkText: !target.textContent ? '_ERROR_' : target.textContent.trim(),
		title: !pageTitle ? '_ERROR_' : pageTitle.trim(),
		linkType: 'Internal',
		totalLinks: linkArray.length,
		linkPosition: linkArray.indexOf(target) + 1,
		pageType,
		pageTemplate,
	});
};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} List - The (unordered) list element.
 */
const otpAnalyticsHelper = (List: HTMLElement): void => {
	const links = Array.from(List.querySelectorAll('a'));
	links.forEach((link) => {
		link.addEventListener('click', otpLinkClickHandler(links));
	});
};

/**
 * Wires up On This Page for analytics
 */
const initialize = () => {
	// On This Page Analytics (For Desktop)
	const onThisPageNavElement = document.querySelector(
		'.cgdp-on-this-page'
	) as HTMLElement;
	if (!onThisPageNavElement) return;
	const otpList = onThisPageNavElement.querySelector('ul');
	if (!otpList) return;
	otpAnalyticsHelper(otpList);
};

export default initialize;
