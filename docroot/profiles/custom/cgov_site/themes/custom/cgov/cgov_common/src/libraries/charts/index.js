import Chart from './Chart';
import rules from './rules';
import charts from './library';
import { getShouldLoadChartWrapper } from './utilities';

let isInitialized = false;

/**
 * We want to spare DOM crawling as much as possible. We'll first test whether the route matches one
 * that could contain a high chart. Following that, we'll then check the DOM for IDs on elements that match
 * stored charts.
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
  const shouldCheckForChartHooks = getShouldLoadChartWrapper(pathName, rules);

  if(shouldCheckForChartHooks) {
    for(let i = 0; i < charts.length; i++){
      const { id, initChart } = charts[i];
      const el = document.getElementById(id);
      if(el){
        initChart(Chart);
      }
    }
  }
}

export default init;
