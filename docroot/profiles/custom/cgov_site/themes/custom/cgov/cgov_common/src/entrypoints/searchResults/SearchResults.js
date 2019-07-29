import initializeSitewideSearchResults from 'Libraries/sitewideSearchResults/sitewideSearchResults';
import 'nci-search-results-app/build/static/css/main.css';

const onDomContentLoaded = () => {
  initializeSitewideSearchResults();
}

window.addEventListener('DOMContentLoaded', onDomContentLoaded);
