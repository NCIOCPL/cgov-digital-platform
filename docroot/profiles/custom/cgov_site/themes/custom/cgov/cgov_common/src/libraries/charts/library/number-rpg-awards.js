const dataFileName = 'number-rpg-awards';
const id = 'NCI-Chart__number-rpg-awards';

function initChart(Chart, rpgData) {
  new Chart(id, {
    chart: rpgData.chartType,
    title: rpgData.chartTitle,
    subtitle: rpgData.chartSubTitle,
    plotOptions: rpgData.plotOptions,
    xAxis: rpgData.xAxis,
    yAxis: rpgData.yAxis,
    series: rpgData.series
  });
};

export default {
  id,
  initChart,
  dataFileName
};
