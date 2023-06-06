import './ncids-home-landing.scss';

import cgdpFeatureCardRow from '../../lib/components/cgdp-feature-card-row';
import cgdpGuideCardRow from '../../lib/components/cgdp-guide-card-row';
import cgdpPromoBlockInit from '../../lib/components/nci-promo-block';
import cgdpLandingRawHtml from '../../lib/components/cgdp-landing-raw-html';
import nciCtaStrip from '../../lib/components/nci-cta-strip';
import nciHeroInit from '../../lib/components/nci-hero';

const onDOMContentLoaded = () => {
	// Init feature cards
	cgdpFeatureCardRow();
	// Init guide cards
	cgdpGuideCardRow();
	// Init promo block
	cgdpPromoBlockInit();
	// Init raw html blocks
	cgdpLandingRawHtml();
	// Init cta
	nciCtaStrip();
	// Init hero
	nciHeroInit();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
