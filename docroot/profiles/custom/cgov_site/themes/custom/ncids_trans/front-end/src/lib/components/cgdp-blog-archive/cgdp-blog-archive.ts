import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';

/**
 * Wires up component per cgdp requirements.
 */
const BEHAVIOR_NAME = 'cgdpBlogArchive';
const ACCORDION_SELECTOR = '.cgdp-blog-archive .usa-accordion';

const initializeAccordion = (accordion: HTMLElement): void => {
	const headingButton = accordion.querySelector('.usa-accordion__button');
	const isOpen = headingButton?.getAttribute('aria-expanded') === 'true';

	USAAccordion.create(accordion, {
		allowMultipleOpen: true,
		openSections: isOpen ? [1] : [],
		headerSelector: 'div.usa-accordion__heading',
	});
};

const attach = (context: ParentNode = document): void => {
	const globalObj = globalThis as typeof globalThis & {
		once?: (id: string, selector: string, context?: ParentNode) => Element[];
	};

	const onceFn = globalObj.once;
	let accordions: Element[] = [];

	if (typeof onceFn === 'function') {
		accordions = onceFn(BEHAVIOR_NAME, ACCORDION_SELECTOR, context);
	} else {
		const contextElement = context as Document | Element;
		accordions = Array.from(
			contextElement.querySelectorAll(ACCORDION_SELECTOR)
		).filter((accordion) => {
			const element = accordion as HTMLElement;
			if (element.dataset.cgdpBlogArchiveInit === 'true') {
				return false;
			}
			element.dataset.cgdpBlogArchiveInit = 'true';
			return true;
		});
	}

	accordions.forEach((accordion) =>
		initializeAccordion(accordion as HTMLElement)
	);
};

const initialize = (): void => {
	const globalObj = globalThis as typeof globalThis & {
		Drupal?: {
			behaviors?: Record<string, { attach: (context: ParentNode) => void }>;
		};
	};

	if (globalObj.Drupal?.behaviors) {
		globalObj.Drupal.behaviors[BEHAVIOR_NAME] = {
			attach,
		};
	}

	attach(document);
};

export default initialize;
