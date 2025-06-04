import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';
import { accordionizeForMobile } from '../../core/util/accordionize-for-mobile';

// Track the accordion instance so we do not repeatedly create/destroy it.
let accordionInstance: USAAccordion | null = null;

/**
 * Wires up the selected resources element
 * as an accordion when on mobile
 */
const initialize = () => {
	// Initialize the Accordion
	accordionInstance = accordionizeForMobile(
		'.cgdp-article-footer-citation',
		accordionInstance
	) as USAAccordion | null; // Because the function can return undefined, we cast it to USAAccordion | null
};

export default initialize;
