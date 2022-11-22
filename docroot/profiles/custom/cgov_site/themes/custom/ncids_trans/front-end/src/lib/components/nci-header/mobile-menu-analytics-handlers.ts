import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler for opening a mobile menu.
 */
export const mobileMenuOpenHandler = () => {
	trackOther('MobilePrimaryNav:Open', 'MobilePrimaryNav:Open', {
		action: 'Open',
		location: 'MobilePrimaryNav',
	});
};

/**
 * Returns cgdp analytic requirement based on Close trigger action.
 * @param action
 */
const getMobileMenuCloseAction = (action: string) => {
	const actions: { [key: string]: string } = {
		Escape: 'CloseEsc',
		Close: 'CloseX',
		Overlay: 'CloseClickAway',
	};
	return actions[action] || '_ERROR_';
};

/**
 * Click handler for closing a mobile menu.
 */
export const mobileMenuCloseHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;
	trackOther('MobilePrimaryNav:Close', 'MobilePrimaryNav:Close', {
		action: getMobileMenuCloseAction(detail.action),
		location: 'MobilePrimaryNav',
	});
};

/**
 * Returns cgdp analytic requirement based on type of link click.
 * @param action
 */
const getMobileMenuLinkClickAction = (action: string) => {
	const actions: { [key: string]: string } = {
		Back: 'Back',
		Child: 'ChildPageMenu',
		Explore: 'ExplorePage',
	};
	return actions[action] || '_ERROR_';
};

/**
 * Click handler for navigating to a primary section without a mega menu.
 * @param event
 */
export const mobileMenuLinkClickHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;
	const action =
		detail.label.includes('Explore') && detail.action !== 'Back'
			? 'Explore'
			: detail.action;

	trackOther('MobilePrimaryNav:LinkClick', 'MobilePrimaryNav:LinkClick', {
		linkText: detail.label,
		location: 'MobilePrimaryNav',
		action: getMobileMenuLinkClickAction(action),
		listNumber: detail.action === 'Back' ? null : detail.index + 1,
	});
};
