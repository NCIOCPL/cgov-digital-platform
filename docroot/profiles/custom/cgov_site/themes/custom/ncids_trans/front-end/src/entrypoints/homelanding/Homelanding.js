import patternInjector from 'Core/libraries/patternInjector';
import carouselPatternSettings from 'Core/libraries/patternInjector/configs/homePageCarouselPatternSettings.js';
import carousel from 'Core/libraries/carousel/carousel';
import "./Homelanding.scss";

const onDOMContentLoaded = () => {
  // We only want to run the pattern injector on the home page.
  const pathName = location.pathname.toLowerCase();
  const isHomePage = /^\/$/.test(pathName);
  if(isHomePage){
    carousel();
    patternInjector(carouselPatternSettings);
  }
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
