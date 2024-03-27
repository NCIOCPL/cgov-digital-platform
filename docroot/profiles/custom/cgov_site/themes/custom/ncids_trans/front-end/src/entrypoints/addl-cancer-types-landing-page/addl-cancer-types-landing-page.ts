import './addl-cancer-types-landing-page.scss';
import cancerTypesAZList from './components/cgdp-cancer-type-az-list';

const onDOMContentLoaded = () => {
	cancerTypesAZList();
};
window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
