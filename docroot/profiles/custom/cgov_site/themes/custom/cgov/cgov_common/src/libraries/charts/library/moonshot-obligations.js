// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__moonshot-obligations"></div>
import moonshotObligationsData from './data/moonshot-obligations.json';
const id = 'NCI-Chart__moonshot-obligations';

function initChart(Chart) {
  new Chart(id, {
    chart: moonshotObligationsData.chartType,
    title: moonshotObligationsData.chartTitle,
    subtitle: moonshotObligationsData.chartSubTitle,
    series: moonshotObligationsData.series,
    drilldown: moonshotObligationsData.drilldown
  });
};

export default {
  id,
  initChart,
};
