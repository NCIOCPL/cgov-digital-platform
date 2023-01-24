const dataFileName = 'management-fund';
const id = 'NCI-Chart__management-fund';

function initChart(Chart, managementFundData) {
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
  dataFileName
};
