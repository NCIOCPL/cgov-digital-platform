import './chart.scss';
import Chart from './Chart';
import rules from './rules';
import charts from './library';
import { getShouldLoadChartWrapper } from './utilities';

let isInitialized = false;

class ChartHttpError extends Error {
  constructor(response) {
    super(`HTTP ${response.status}: ${response.statusText} — ${response.url}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.response = response; // preserve for body access if needed
  }
}

/**
 * We want to spare DOM crawling as much as possible. We'll first test whether the route matches one
 * that could contain a high chart. Following that, we'll then check the DOM for IDs on elements that match
 * stored charts.
 *
 */
const init = () => {
  if (isInitialized) {
    return;
  } else {
    isInitialized = true;
  }

  const pathName = location.pathname.toLowerCase();
  const shouldCheckForChartHooks = getShouldLoadChartWrapper(pathName, rules);

  if (shouldCheckForChartHooks) {
    for (let i = 0; i < charts.length; i++) {
      const { dataFileName, id, initChart, miscDataURL } = charts[i];
      const el = document.getElementById(id);

      if (el) {
        const { chartRevision } = el.dataset;
        getChartData(dataFileName, chartRevision, miscDataURL).then(
          ({ data, miscData }) => initChart(Chart, data, miscData)
        );
      }
    }
  }
};

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
    const requests = requestURLArray.map((requestURL) =>
      fetch(requestURL).then((res) => {
        // Throw custom error with response details.
        if (!res.ok) {
          throw new ChartHttpError(res);
        }
        return res.json();
      })
    );

    const [data, miscData] = await Promise.all(requests);
    return { data, miscData };
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      throw new Error(`Couldn't retrieve data for chart ${dataFileName}`);
    }
    if (error instanceof ChartHttpError) {
      throw error; // Re-throw ChartHttpError for caller to handle
    }
    throw new Error(`Couldn't retrieve data for chart ${dataFileName}`);
  }
};

export default init;
