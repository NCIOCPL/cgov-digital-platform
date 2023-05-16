import './ncids-home-landing.scss';

import cgdpFeatureCardRow from '../../lib/components/cgdp-feature-card-row';
import cgdpPromoBlockInit from '../../lib/components/nci-promo-block';

const onDOMContentLoaded = () => {
	// Init feature cards
	cgdpFeatureCardRow();
	// Init promoblock
	cgdpPromoBlockInit();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
