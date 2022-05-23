import initializeCTSApp from 'Libraries/cts/cts';
import './cts-app.scss';

const onDOMContentLoaded = () => {
	initializeCTSApp();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
