import './chart.scss';
import Chart from './Chart';
import rules from './rules';
import charts from './library';
import { getShouldLoadChartWrapper } from './utilities';

let isInitialized = false;

/**
 * Preserve useful fetch response details when chart data requests fail.
 */
class ChartHttpError extends Error {
  constructor(response) {
    super(`HTTP ${response.status}: ${response.statusText} — ${response.url}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.response = response; // Keep the raw response available to callers.
  }
}

/**
 * Initialize known legacy charts once per page load.
 * Route rules let us avoid scanning the DOM on pages that cannot contain these charts.
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
    // Only registered chart IDs are checked, keeping the DOM work bounded.
    for (let i = 0; i < charts.length; i++) {
      const { dataFileName, id, initChart, miscDataURL } = charts[i];
      const el = document.getElementById(id);

      if (el) {
        const { chartRevision } = el.dataset;
        // Start Highcharts loading while chart data fetches to reduce startup time.
        const highchartsPreload = Chart.preload();
        const chartData = getChartData(dataFileName, chartRevision, miscDataURL);

        Promise.all([chartData, highchartsPreload])
          .then(([{ data, miscData }]) => initChart(Chart, data, miscData))
          .catch((error) => {
            console.error(`Could not initialize chart "${id}".`, error);
          });
      }
    }
  }
};

/**
 * Fetch chart JSON and any supplemental data, such as map topology.
 */
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
    // Fetch primary and supplemental chart data concurrently.
    const requests = requestURLArray.map((requestURL) =>
      fetch(requestURL).then((res) => {
        // Preserve HTTP response metadata for initialization error logging.
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
      // The Fetch API rejects with TypeError for network-layer failures.
      throw new Error(`Couldn't retrieve data for chart ${dataFileName}`);
    }
    if (error instanceof ChartHttpError) {
      // Keep status, URL, and response details intact for callers.
      throw error;
    }
    throw new Error(`Couldn't retrieve data for chart ${dataFileName}`);
  }
};

export default init;
