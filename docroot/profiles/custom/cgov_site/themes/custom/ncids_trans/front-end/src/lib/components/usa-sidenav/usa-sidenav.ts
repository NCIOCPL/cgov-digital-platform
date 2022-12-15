import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Tracks a side nav click.
 * @param linkText The text of the link.
 * @param listNumber The position of the link in the flattened tree.
 * @param clickedLevel The level of the item clicks.
 * @param activeLevel The level of the current page.
 * @param sideNavHeading The text of the root navigation item.
 */
const track = (
	linkText: string,
	listNumber: number,
	clickedLevel: string,
	activeLevel: string,
	sideNavHeading: string
) => {
	trackOther('SideNav:LinkClick', 'SideNav:LinkClick', {
		linkText,
		location: 'SideNav',
		listNumber,
		clickedLevel,
		activeLevel,
		sideNavHeading,
	});
};

/**
 * Gets the text of the header.
 * @param navEl The parent UL of the side nav.
 */
const getRootHeaderText = (navEl: HTMLElement) => {
	const errorMsg = '_ERROR_';
	const rootli = navEl.querySelector(':scope > li') as HTMLElement;
	if (!rootli) {
		return errorMsg;
	}

	const rootlink = rootli.querySelector(':scope > a') as HTMLElement;
	if (!rootlink) {
		return errorMsg;
	}

	return rootlink.textContent || errorMsg;
};

/**
 * Gets the level of the active navigation item.
 * @param navEl The parent UL of the side nav.
 */
const getActiveLevel = (navEl: HTMLElement) => {
	// This logic is based on the assumption that we are going to use the bottom
	// active nav item as the level, even if we are on a child page that does
	// not display in the nav. (e.g. anemia under side-effects. See the unit tests)
	const activeItems = navEl.querySelectorAll('a.usa-current');
	return 'L' + activeItems.length;
};

/**
 * Gets the level of the active navigation item.
 * @param navEl The parent UL of the side nav.
 * @param clickedLink The link element that was clicked.
 */
const getClickLevel = (navEl: HTMLElement, clickedLink: HTMLAnchorElement) => {
	let level = 0;
	let currEl: HTMLElement | null = clickedLink;

	do {
		if (currEl.tagName === 'UL') {
			level += 1;
		}
		currEl = currEl !== navEl ? currEl.parentElement : null;
	} while (currEl != null);

	return 'L' + level;
};

/**
 * Gets the item number of the current element.
 * @param navEl The parent UL of the side nav.
 * @param clickedEl The clicked link
 */
const getListItemNumber = (
	navEl: HTMLElement,
	clickedEl: HTMLAnchorElement
) => {
	const links = navEl.querySelectorAll('a');
	for (const [idx, link] of links.entries()) {
		if (link === clickedEl) {
			return idx + 1;
		}
	}

	// We need to have some return here for the typing, except how this is constructed,
	// there is no possible way to hit this line cause our event handler is only for
	// anchors, and if this is getting called it is cause we had an anchor in the ul.
	// Therefore there is no condition where this could be called and there is no
	// anchor.
	/* istanbul ignore next */
	return -99;
};

/**
 * Click handler for the language toggle click.
 * @param sideNavEl the side nav element.
 */
const sidenavLinkAnalyticsHandler =
	(sideNavEl: HTMLElement) => (evt: Event) => {
		const target = evt.currentTarget as HTMLAnchorElement;

		const linkText = target.textContent || '_ERROR_';
		const listNumber = getListItemNumber(sideNavEl, target);
		const clickedLevel = getClickLevel(sideNavEl, target);
		const activeLevel = getActiveLevel(sideNavEl);
		const sideNavHeading = getRootHeaderText(sideNavEl);

		track(linkText, listNumber, clickedLevel, activeLevel, sideNavHeading);
	};

/**
 * Wires up a usa-sidenav for the cdgp requirements.
 */
const initialize = () => {
	const sideNavEl = document.querySelector('ul.usa-sidenav') as HTMLElement;
	if (!sideNavEl) return;

	const navLinks = sideNavEl.querySelectorAll('a');
	navLinks.forEach((link) => {
		link.addEventListener('click', sidenavLinkAnalyticsHandler(sideNavEl));
	});
};

export default initialize;
