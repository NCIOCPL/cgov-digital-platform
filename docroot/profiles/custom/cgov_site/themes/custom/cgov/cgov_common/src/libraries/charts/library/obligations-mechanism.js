const dataFileName = 'obligations-mechanism';
const id = 'NCI-Chart_obligations-mechanism';

function initChart(Chart, obligationsMechanismData) {
  new Chart(id, {
    chart: obligationsMechanismData.chartType,
    plotOptions: obligationsMechanismData.plotOptions,
    colors: obligationsMechanismData.colors,
    title: obligationsMechanismData.chartTitle,
    subtitle: obligationsMechanismData.chartSubTitle,
    series: obligationsMechanismData.series,
    drilldown: obligationsMechanismData.drilldown,
    responsive: obligationsMechanismData.responsive
  });
};

export default {
  id,
  initChart,
  dataFileName
}
