import './addl-cancer-types-landing-page.scss';
import { USAAccordion } from '@nciocpl/ncids-js';
import cancerTypesAZList from './components/cgdp-cancer-type-az-list';

const onDOMContentLoaded = () => {
	USAAccordion.createAll();

	cancerTypesAZList();
};
window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
