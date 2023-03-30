const dataFileName = 'html-bar';
const id = 'NCI-Chart__html-bar';

function initChart(Chart, htmlBarData) {
  new Chart(id, {
    chart: htmlBarData.chartType,
    title: htmlBarData.chartTitle,
    subtitle: htmlBarData.chartSubTitle,
    plotOptions: htmlBarData.plotOptions,
    yAxis: htmlBarData.yAxis,
    xAxis: htmlBarData.xAxis,
    tooltip: htmlBarData.tooltip,
    series: htmlBarData.series
  });
};

export default {
  id,
  initChart,
  dataFileName
}
