// <div style="min-width:310px; height:500px; margin:0 auto;" id="NCI-Chart__html-nrsa"></div>
import nrsaData from './data/html-nrsa.json';
const id = 'NCI-Chart__html-nrsa';

function initChart(Chart) {
  new Chart(id,
    {
      chart: nrsaData.chartType,
      title: nrsaData.chartTitle,
      subtitle: nrsaData.chartSubTitle,
      yAxis: {...nrsaData.yAxis, label: function () { return Highcharts.numberFormat(this.value, 0) }},
      xAxis: nrsaData.xAxis,
      series: nrsaData.series
    });
};

export default {
  id,
  initChart,
}
