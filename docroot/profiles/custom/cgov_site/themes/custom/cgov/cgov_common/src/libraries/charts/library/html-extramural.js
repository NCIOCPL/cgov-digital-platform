const dataFileName = 'html-extramural';
const id = 'NCI-Chart__html-extramural';

function initChart(Chart, extramuralFundsData) {
  new Chart(id, {
    chart: extramuralFundsData.chartType,
    title: extramuralFundsData.chartTitle,
    subtitle: extramuralFundsData.chartSubTitle,
    series: extramuralFundsData.series,
    drilldown: extramuralFundsData.drilldown
  });
};

export default {
  id,
  initChart,
  dataFileName
};
