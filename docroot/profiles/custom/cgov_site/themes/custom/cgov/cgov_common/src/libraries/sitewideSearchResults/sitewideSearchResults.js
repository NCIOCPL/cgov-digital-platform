import sitewideSearchResults from 'nci-search-results-app';
import { createEventHandler } from 'Core/utilities';
import { analyticsHandler, createAudioPlayerHandler } from './handlers';

// #### THIS IS AN OBJECT ON THE WINDOW IN A RAW HTML SCRIPT BLOCK
const rootId = 'NCI-search-results-root';
const search = urlOptionsMap => {
  const baseEndpoint = 'https://webapis.cancer.gov/sitewidesearch/v1/Search/cgov/en/';
  const endpoint = baseEndpoint + urlOptionsMap.queryString;
  return endpoint;
}
const dictionary = urlOptionsMap => {
  const baseEndpoint = 'https://www.cancer.gov/Dictionary.Service/v1/search?dictionary=term&language=English&searchType=exact&offset=0&maxResuts=0';
  const searchText = encodeURI(urlOptionsMap.term);
  const endpoint = `${ baseEndpoint }&searchText=${ searchText }`;
  return endpoint;
}
const bestBets = urlOptionsMap => {
  const baseEndpoint = 'https://webapis.cancer.gov/bestbets/v1/BestBets/live/en/';
  const searchText = encodeURI(urlOptionsMap.term);
  const endpoint = baseEndpoint + searchText;
  return endpoint;
}

window.nciSearchResultsConfig = {
  rootId,
  services: {
    search,
    dictionary,
    bestBets,
  },
}
// ##### END RAW HTML BLOCK

const config = window.nciSearchResultsConfig;

const audioPlayerHandler = createAudioPlayerHandler(config.rootId);

const useCache = false;
const eventHandler = createEventHandler(useCache);

eventHandler.subscribe(analyticsHandler);
eventHandler.subscribe(audioPlayerHandler);

config.eventHandler = eventHandler.onEvent;

const initializeSitewideSearchResults = () => {
  sitewideSearchResults(config);
}

export default initializeSitewideSearchResults;
