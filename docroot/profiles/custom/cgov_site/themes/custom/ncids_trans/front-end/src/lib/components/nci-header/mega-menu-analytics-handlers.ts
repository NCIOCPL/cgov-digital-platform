import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Click handler for clicking on a link within the mega menu
 * @param event
 */
export const megaMenuLinkClickHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;
	const menuId = detail.menuId;
	const primaryNavItemEl = document.querySelector(
		`button[data-menu-id="${menuId}"]`
	);

	// So this gets the contents of the menu button that opened this menu.
	// Unfortunately, we don't actually know which item is opened in the
	// event data. This is because the mega menu contents are not attached
	// to the mega menu. We do have access to the ID and thus we can find
	// the menu item, and thus the label.

	const primaryNavItem = primaryNavItemEl
		? (primaryNavItemEl.textContent ?? '').trim()
		: '';
	trackOther('PrimaryNav:LinkClick', 'PrimaryNav:LinkClick', {
		location: 'Primary Nav',
		linkType: detail.linkType,
		listHeading: detail.heading,
		listHeadingNumber: detail.headingIndex,
		linkText: detail.label,
		primaryNavItem,
		listItemNumber: detail.listItemNumber,
	});
};

/**
 * Click handler for opening a mega menu.
 * @param event
 */
export const megaMenuOpenHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;
	trackOther('PrimaryNav:Open', 'PrimaryNav:Open', {
		primaryNavItem: detail.label,
		location: 'Primary Nav',
	});
};

/**
 * Click handler for navigating to a primary section without a mega menu.
 * @param event
 */
export const primaryNavLinkClickHandler = (event: Event) => {
	const detail = (event as CustomEvent).detail;
	trackOther('PrimaryNav:LinkClick', 'PrimaryNav:LinkClick', {
		location: 'Primary Nav',
		linkType: 'Primary Nav Button',
		linkText: detail.label,
		listHeading: detail.label,
		primaryNavItem: detail.label,
		listHeadingNumber: 0,
		listItemNumber: 0,
	});
};
