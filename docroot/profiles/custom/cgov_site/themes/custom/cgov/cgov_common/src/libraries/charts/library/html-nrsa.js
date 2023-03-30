import { buildAxisData } from '../utilities';

const dataFileName = 'html-nrsa';
const id = 'NCI-Chart__html-nrsa';

const yAxisLabelFormatter =  [
  {formatter: function () { return Highcharts.numberFormat(this.value, 0) }}
];

function initChart(Chart, nrsaData) {
  new Chart(id,
    {
      chart: nrsaData.chartType,
      plotOptions: nrsaData.plotOptions,
      title: nrsaData.chartTitle,
      subtitle: nrsaData.chartSubTitle,
      yAxis: buildAxisData(nrsaData.yAxis, yAxisLabelFormatter),
      xAxis: nrsaData.xAxis,
      series: nrsaData.series
    });
};

export default {
  id,
  initChart,
  dataFileName
}
