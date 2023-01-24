import { buildAxisData } from "../utilities";

const dataFileName = 'rpg-cost-per-award';
const id = 'NCI-Chart__rpg-cost-per-award';

const yAxisLabelFormatter =  [
  {formatter: function () {return Highcharts.numberFormat(this.value, 0)}},
  {formatter: function () {return '$' + Highcharts.numberFormat(this.value, 0)}},
  {formatter: function () {return '$' + Highcharts.numberFormat(this.value, 0)}},
  {}
]

const responsiveYAxisLabelFormatter =  [
  {formatter: function () {return (this.value / 1000)}},
  {formatter: function () {return '$' + (this.value / 1000000)}},
  {}
]

function buildResponsiveData(responsiveData, labelFormatter) {
  const axisData = buildAxisData(responsiveData.rules[0].chartOptions.yAxis, labelFormatter);
  responsiveData.rules[0].chartOptions.yAxis = axisData;
  return responsiveData;
};

function initChart(Chart, rpgCostPerAwardData) {
  new Chart(id, {
    chart: rpgCostPerAwardData.chartType,
    title: rpgCostPerAwardData.chartTitle,
    subtitle: rpgCostPerAwardData.chartSubTitle,
    plotOptions: rpgCostPerAwardData.plotOptions,
    series: rpgCostPerAwardData.series,
    yAxis: buildAxisData(rpgCostPerAwardData.yAxis, yAxisLabelFormatter),
    responsive: buildResponsiveData(rpgCostPerAwardData.responsive, responsiveYAxisLabelFormatter)
  });
};

export default {
  id,
  initChart,
  dataFileName
}
