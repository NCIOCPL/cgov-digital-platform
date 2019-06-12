import Chart from './Chart';
import rules from './rules';
import { getShouldLoadChartWrapper } from './utilities';

let isInitialized = false;

/**
 * Add the Chart class to the window in the event that we are on a whitelisted page (where
 * calls to the library will be made by inlined scripts).
 *
 */
const init = () => {
  if(isInitialized) {
    return;
  }
  else {
    isInitialized = true;
  }

  const pathName = location.pathname.toLowerCase();
  const shouldLoadChartWrapper = getShouldLoadChartWrapper(pathName, rules);

  if(shouldLoadChartWrapper) {
    console.log('Chart now available on the window.')
    window.Chart = Chart;
    // Broadcast an event saying the chart wrapper has loaded for inline scripts to listen to.
    /**
     * Script blocks calling Chart should be wrapped as such:
     *
     * ```
     * const onChartLoaded = () => {
     *  const $ = window.jQuery; // If the script block uses $
     *
     *  // Custom Chart code goes here...
     *
     * }
     * window.addEventListener('NCI.Chart.load', onChartLoaded);
     * ```
     */

    window.dispatchEvent(new CustomEvent('NCI.Chart.load'));
  }
}

export default init;
