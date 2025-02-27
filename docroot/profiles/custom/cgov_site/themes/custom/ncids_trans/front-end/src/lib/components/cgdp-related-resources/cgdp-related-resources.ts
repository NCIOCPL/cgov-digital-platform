import { USAAccordion } from '@nciocpl/ncids-js/usa-accordion';
import { accordionizeForMobile } from '../../core/util/accordionize-for-mobile';

// import { trackOther } from '../../core/analytics/eddl-util';

// Track the accordion instance so we do not repeatedly create/destroy it.
let accordionInstance: USAAccordion | null = null;

/**
 * Initialize USA Accordion
 */
const initialize = (): void => {
	accordionInstance = accordionizeForMobile(
		'.cgdp-related-resources',
		accordionInstance
	) as USAAccordion | null; // Because the function can return undefined, we cast it to USAAccordion | null
};

export default initialize;
