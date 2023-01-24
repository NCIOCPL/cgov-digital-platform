// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__appropriations"></div>
import appropriationsData from './data/bypass-appropriations.json';
const id = 'NCI-Chart__appropriations';

function initChart(Chart) {
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
}
