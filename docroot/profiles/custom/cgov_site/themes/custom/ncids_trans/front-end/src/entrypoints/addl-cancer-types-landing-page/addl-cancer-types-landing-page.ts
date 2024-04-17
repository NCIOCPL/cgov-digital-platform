import './addl-cancer-types-landing-page.scss';
import cancerTypesAZList from './components/cgdp-cancer-type-az-list';
import findCancerType from './components/cgdp-find-a-cancer-type';

const onDOMContentLoaded = () => {
	cancerTypesAZList();

	findCancerType();
};
window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
