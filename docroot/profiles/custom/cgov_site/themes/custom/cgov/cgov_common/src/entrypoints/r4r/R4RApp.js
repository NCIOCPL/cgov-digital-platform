import initializeR4RApp from 'Libraries/r4r/r4r';
import './R4RApp.scss';

const onDOMContentLoaded = () => {
  initializeR4RApp();
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
