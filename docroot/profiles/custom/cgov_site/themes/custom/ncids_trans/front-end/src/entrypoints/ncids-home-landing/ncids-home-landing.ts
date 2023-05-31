import './ncids-home-landing.scss';

import cgdpFeatureCardRow from '../../lib/components/cgdp-feature-card-row';
import cgdpGuideCardRow from '../../lib/components/cgdp-guide-card-row';
import cgdpPromoBlockInit from '../../lib/components/nci-promo-block';
import nciCtaStrip from '../../lib/components/nci-cta-strip';

const onDOMContentLoaded = () => {
	// Init feature cards
	cgdpFeatureCardRow();
	// Init guide cards
	cgdpGuideCardRow();
	// Init promoblock
	cgdpPromoBlockInit();
	// Init cta
	nciCtaStrip();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
