const dataFileName = 'moonshot-obligations';
const id = 'NCI-Chart__moonshot-obligations';

function initChart(Chart, moonshotObligationsData) {
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
  dataFileName
};
