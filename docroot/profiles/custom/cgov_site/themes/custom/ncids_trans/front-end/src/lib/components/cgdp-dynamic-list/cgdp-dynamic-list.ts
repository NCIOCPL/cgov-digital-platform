import {
	getContainerItemInfo,
	landingClickTracker,
} from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets the title of the Dynamic List
 * @param {HTMLElement} collectionElement - The NCIDS Dynamic List.
 */
const getTitle = (collectionElement: HTMLElement): string =>
	collectionElement.querySelector('.nci-heading--label')?.textContent ||
	'No Title';

/**
 * Gets the componentTheme of the Dynamic List
 * @param {HTMLElement} collectionElement - The NCIDS Dynamic List.
 */
const getTheme = (collectionElement: HTMLElement): string =>
	collectionElement.dataset.dynamicListDisplay || '_ERROR_';

/**
 * Gets the componentVariant of the Dynamic List
 * @param {HTMLElement} collectionElement - The NCIDS Dynamic List.
 */
const getVariant = (collectionElement: HTMLElement): string =>
	collectionElement.dataset.dynamicListView || '_ERROR_';

/**
 * Gets the link area of the link clicked
 * @param {HTMLElement} linkClicked - Clicked anchor element.
 */
const getLinkArea = (linkClicked: HTMLElement): string => {
	const linkClass = linkClicked.getAttribute('class');
	if (linkClass === 'usa-link') {
		return 'Collection Item';
	}
	return 'View All Button';
};

/**
 * Click handler for the language toggle click.
 * @param collectionElement the dynamic-list element.
 */
const collectionLinkClickHandler =
	(
		collectionElement: HTMLElement,
		totalLinks: HTMLElement[],
		componentTheme: string,
		componentVariant: string
	) =>
	(evt: Event) => {
		const target = evt.currentTarget as HTMLElement;
		const { containerItems, containerItemIndex } = getContainerItemInfo(target);
		landingClickTracker(
			target,
			'Collection', // linkName
			containerItems, // containerItems
			containerItemIndex, // containerItemsIndex
			'Dynamic List', // componentType
			componentTheme, // componentTheme
			componentVariant, // componentVariant
			getTitle(collectionElement) as string, // title
			'Internal', // linkType
			!target.textContent ? '_ERROR_' : target.textContent.trim(), // linkText
			getLinkArea(target), // linkArea
			totalLinks.length, // totalLinks
			totalLinks.indexOf(target) + 1 // linkPosition
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} dynamicList - The Dynamic List element.
 */
const collectionHelper = (dynamicList: HTMLElement): void => {
	const links = Array.from(dynamicList.querySelectorAll('a')) as HTMLElement[];
	const collectionEl = dynamicList.querySelector(
		'.usa-collection'
	) as HTMLElement;
	links.forEach((link) => {
		link.addEventListener(
			'click',
			collectionLinkClickHandler(
				dynamicList,
				links,
				getTheme(collectionEl),
				getVariant(collectionEl)
			)
		);
	});
};

/**
 * Wires up a dynamic list for the cdgp requirements.
 */
const initialize = () => {
	const dynamicLists = document.querySelectorAll(
		'.cgdp-dynamic-list'
	) as NodeListOf<HTMLElement>;
	if (!dynamicLists.length) return;
	dynamicLists.forEach((dynamicListEl) => {
		const dynamicList = dynamicListEl as HTMLElement;
		collectionHelper(dynamicList);
	});
};

export default initialize;
