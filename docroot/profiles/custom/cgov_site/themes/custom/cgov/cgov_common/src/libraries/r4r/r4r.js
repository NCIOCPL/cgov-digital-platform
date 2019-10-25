import initializeR4R from 'r4r-app';
import 'r4r-app/build/static/css/main.css';
import initializeCancerGov from './config';

const initializeR4RApp = () => {

  // Assume this will be called from ondomloaded

  // React Helmet is removing all elements with data-react-helmet="true" on the page except the ones it directly controls. This is a big
  // issue. This code adds it only to the elements we want to control manually to avoid that issue.
  const elementSelectors = [
      ['name', 'description'],
      ['property', 'og:title'],
      ['property', 'og:description'],
      ['property', 'og:url'],
  ];
  const elementsUsedByR4R = elementSelectors.map(el => {
      return document.querySelector(`meta[${el[0]}="${el[1]}"]`);
  })
  elementsUsedByR4R.forEach(el => {
      // Some elements are originated by react-helmet after this script runs and will be null
      if(el){
          el.setAttribute('data-react-helmet', "true");
      }
  })

  initializeCancerGov(initializeR4R);
}

export default initializeR4RApp;
