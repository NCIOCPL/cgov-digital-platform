import "./chart.scss";
import axios from 'axios';
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
      const { dataFileName, id, initChart, miscDataURL } = charts[i];
      const el = document.getElementById(id);

      if(el){
        const { chartRevision } = el.dataset;
        getChartData(dataFileName, chartRevision, miscDataURL)
          .then(({data, miscData}) => initChart(Chart, data, miscData));
      }
    }
  }
}

const getChartData = async (dataFileName, chartRevision, miscDataURL) => {
  const { chartData } = window.CDEConfig || {};
  const { factBook } = chartData || {};
  const { baseUrl, dataType } = factBook || {};
  if (!chartRevision) {
    console.warn(
      `Could not find data attribute "chart-revision" within custom block. There could be updated chart data available not displayed. Ensure data attribute is present within custom block to obtain most recent data.`
    );
  }
  const fileURL = `${baseUrl}/${dataFileName}.${dataType || 'json'}?t=${chartRevision || ''}`;
  const requestURLArray = [fileURL];

  if (miscDataURL) {
    requestURLArray.push(miscDataURL);
  }

  try {
    const requests = requestURLArray.map(requestURL => axios.get(requestURL));

    const [chartConfigResponse, miscDataResponse] = await axios.all(requests);
    const data = chartConfigResponse?.data;
    const miscData = miscDataResponse?.data;
    return {data, miscData};
  } catch (error) {
    if (axios.isAxiosError(error) && error.response ) {
      throw new Error(`An error was returned while fetching data for FactBook ${dataFileName} chart with status ${error.response.status}`)
    }
    throw new Error(`Couldn't retrieve data for chart ${dataFileName}`);
  }
};

export default init;
