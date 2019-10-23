import initializeCTSApp from 'Libraries/cts/cts';
import './CTSApp.scss';

const onDOMContentLoaded = () => {
  initializeCTSApp();
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
