import { broadcastCustomEvent } from 'Core/libraries/customEventHandler';

const handleResultClick = ({ payload }) => {
  // The payload here is the arguments the analytics call needs in the correct order.
  broadcastCustomEvent('NCI.sitewide-search-results-result.click', {
    node: window,
    data: payload,
    // We need to call the custom event immediately rather than
    // attach it as an event callback in the original design.
  })();
}

const handleResultsLoad = ({ payload }) => {
  broadcastCustomEvent('NCI.sitewide-search-results.load', {
    node: window,
    data: payload,
    // We need to call the custom event immediately rather than
    // attach it as an event callback in the original design.
  })();
}

const eventsWeCareAbout = {
  '@@event/result_click': handleResultClick,
  '@@event/results_load': handleResultsLoad,
}

const analyticsHandler = eventArray => {
  // There is only ever one element in the event array because we are not
  // dumping the cache at any point (which may contain multiple events).
  const event = eventArray[0];
  const { type } = event;
  const eventHandler = eventsWeCareAbout[type];
  if(eventHandler){
    eventHandler(event);
  }
}

export default analyticsHandler;
