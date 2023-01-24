// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__number-rpg-awards"></div>
import rpgData from './data/number-rpg-awards.json';
const id = 'NCI-Chart__number-rpg-awards';

function initChart(Chart) {
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
  initChart
};
