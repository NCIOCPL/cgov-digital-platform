import initializeCTSApp from 'Libraries/cts/cts';

import '@nciocpl/clinical-trials-search-app/build/static/main.f6e704c2.chunk.scss'; // gotta change the output to not use the hash

const onDOMContentLoaded = () => {
  //do something here
  //ctsReactApp();
  initializeCTSApp();
  console.log("CTS!!!")
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
