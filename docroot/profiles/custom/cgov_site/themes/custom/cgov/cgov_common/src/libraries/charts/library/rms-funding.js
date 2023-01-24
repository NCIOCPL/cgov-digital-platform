const dataFileName = 'rms-funding';
const id = 'NCI-Chart__rms-funding';

function initChart(Chart, rmsFundingData) {
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
  dataFileName
};
