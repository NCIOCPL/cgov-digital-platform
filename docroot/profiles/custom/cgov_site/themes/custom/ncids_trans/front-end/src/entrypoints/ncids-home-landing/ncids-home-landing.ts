import './ncids-home-landing.scss';

import cgdpFeatureCardRow from '../../lib/components/cgdp-feature-card-row';

const onDOMContentLoaded = () => {
	// Init feature cards
	cgdpFeatureCardRow();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
