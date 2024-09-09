import {
	getContainerItemInfo,
	landingClickTracker,
} from '../../core/analytics/landing-page-contents-helper';

/**
 * Gets the title of the List
 * @param {HTMLElement} collectionElement - The NCIDS List.
 */
const getTitle = (collectionElement: HTMLElement): string =>
	collectionElement.querySelector('.nci-heading--label')?.textContent ||
	'Not Defined';

/**
 * Gets the componentVariant of the List
 * @param {HTMLElement} collectionElement - The NCIDS List.
 */
const getVariant = (collectionElement: HTMLElement): string =>
	collectionElement.dataset.listComponentVariant || '_ERROR_';

/**
 * Click handler for the language toggle click.
 * @param collectionElement the list element.
 */
const collectionLinkClickHandler =
	(collectionElement: HTMLElement, totalLinks: HTMLElement[]) =>
	(evt: Event) => {
		const target = evt.currentTarget as HTMLElement;
		const { containerItems, containerItemIndex } = getContainerItemInfo(target);
		const collectionItem = collectionElement.querySelector(
			'.usa-collection__item'
		) as HTMLElement;
		landingClickTracker(
			target,
			'List', // linkName
			containerItems, // containerItems
			containerItemIndex, // containerItemsIndex
			'List', // componentType
			'Not Defined', // componentTheme
			getVariant(collectionItem), // componentVariant
			getTitle(collectionElement) as string, // title
			'Internal', // linkType
			!target.textContent ? '_ERROR_' : target.textContent.trim(), // linkText
			'Title', // linkArea
			totalLinks.length, // totalLinks
			totalLinks.indexOf(target) + 1 // linkPosition
		);
	};

/**
 * Gathers data to pass through to event listener.
 * @param {HTMLElement} List - The List element.
 */
const collectionHelper = (List: HTMLElement): void => {
	const links = Array.from(List.querySelectorAll('a'));
	links.forEach((link) => {
		link.addEventListener('click', collectionLinkClickHandler(List, links));
	});
};

/**
 * Wires up lists for the cdgp requirements.
 */
const initialize = () => {
	const Lists = document.querySelectorAll(
		'.cgdp-list'
	) as NodeListOf<HTMLElement>;
	if (!Lists.length) return;
	Lists.forEach((ListEl) => {
		const List = ListEl as HTMLElement;
		collectionHelper(List);
	});
};

export default initialize;
