// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__html-bar"></div>
import htmlBarData from './data/html-bar.json';
const id = 'NCI-Chart__html-bar';

function initChart(Chart) {
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
}
