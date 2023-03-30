const dataFileName = 'aids-funding';
const id = 'NCI-Chart__aids-funding';

function initChart(Chart, data) {
  new Chart(id, {
    chart: data.chartType,
    title: data.chartTitle,
    subtitle: data.chartSubTitle,
    plotOptions: data.plotOptions,
    xAxis: data.xAxis,
    yAxis: data.yAxis,
    series: data.series
  });

};

export default {
  id,
  initChart,
  dataFileName
};
