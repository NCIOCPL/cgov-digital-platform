const dataFileName = 'bypass-appropriations';
const id = 'NCI-Chart__appropriations';

function initChart(Chart, appropriationsData) {
  new Chart(id, {
    chart: appropriationsData.chartType,
    title: appropriationsData.chartTitle,
    subtitle: appropriationsData.chartSubTitle,
    xAxis: appropriationsData.xAxis,
    plotOptions: appropriationsData.plotOptions,
    yAxis: appropriationsData.yAxis,
    series: appropriationsData.series,
    tooltip: appropriationsData.tooltip
  });
};

export default {
  id,
  initChart,
  dataFileName
}
