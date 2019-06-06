import patternInjector from 'Core/libraries/patternInjector';
import patternSettings from 'Core/libraries/patternInjector/configs/nciOrgPatternSettings.js';
import "./Minilanding.scss";

const onDOMContentLoaded = () => {
  // We only want to run the pattern injector on the home page.
  const pathName = location.pathname.toLowerCase();
  const isNCIOrganizationPage = /^\/about-nci\/organization\/?$/.test(pathName);
  if(isNCIOrganizationPage){
    patternInjector(patternSettings);
  }
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
