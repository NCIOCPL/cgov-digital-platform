// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__management-fund"></div>
import managementFundData from './data/management-fund.json';
const id = 'NCI-Chart__management-fund';

function initChart(Chart) {
  new Chart(id, {
    chart: managementFundData.chartType,
    title: managementFundData.chartTitle,
    subtitle: managementFundData.chartSubTitle,
    series: managementFundData.series,
    drilldown: managementFundData.drilldown
  });

};

export default {
  id,
  initChart,
};
