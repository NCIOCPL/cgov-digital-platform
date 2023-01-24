// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__rms-funding"></div>
import rmsFundingData from './data/rms-funding.json';
const id = 'NCI-Chart__rms-funding';

function initChart(Chart) {
  new Chart(id, {
    chart: rmsFundingData.chartType,
    title: rmsFundingData.chartTitle,
    subtitle: rmsFundingData.chartSubTitle,
    tooltip: {
      pointFormat: '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>${point.y}</div>'
    },
    plotOptions: rmsFundingData.plotOptions,
    xAxis: rmsFundingData.xAxis,
    yAxis: rmsFundingData.yAxis,
    series: rmsFundingData.series,
    drilldown: rmsFundingData.drilldown
  });

};

export default {
  id,
  initChart,
};
