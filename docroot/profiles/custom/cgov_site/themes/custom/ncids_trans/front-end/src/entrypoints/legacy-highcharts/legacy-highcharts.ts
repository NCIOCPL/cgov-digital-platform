import './legacy-highcharts.scss';
import charts from 'Libraries/charts';

const onDOMContentLoaded = () => {
	charts();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
