import { buildAxisData } from '../utilities/index';

const dataFileName = 'html-amount';
const id = 'NCI-Chart__compare-html-amount';

const yAxisLabelFormatter =  [
  {formatter: function () { return '$' + this.value / 1000 + 'M' }},
  {formatter: function () { return this.value / 1000 + 'M' }},
  {formatter: function () { return Highcharts.numberFormat(this.value, 0) }}
];

function initChart(Chart, htmlAmountData) {
  new Chart(id, {
    chart: htmlAmountData.chartType,
    plotOptions: htmlAmountData.plotOptions,
    title: htmlAmountData.chartTitle,
    subtitle: htmlAmountData.chartSubTitle,
    yAxis: buildAxisData(htmlAmountData.yAxis, yAxisLabelFormatter),
    tooltip: htmlAmountData.tooltip,
    series: htmlAmountData.series
  });
};

export default {
  id,
  initChart,
  dataFileName
};
