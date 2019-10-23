import initializeCTSApp from 'Libraries/cts/cts';
//import '@nciocpl/clinical-trials-search-app/build/static/css/main.css'; // gotta change the output to not use the hash

const onDOMContentLoaded = () => {
  initializeCTSApp();
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
