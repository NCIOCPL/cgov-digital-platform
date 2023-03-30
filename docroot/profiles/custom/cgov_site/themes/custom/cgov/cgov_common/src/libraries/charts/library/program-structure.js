const dataFileName = 'program-structure';
const id = 'NCI-Chart__program-structure'

function initChart(Chart, programStructureData) {
  new Chart(id, {
    chart: programStructureData.chartType,
    title: programStructureData.chartTitle,
    subtitle: programStructureData.chartSubTitle,
    series: programStructureData.series,
    drilldown: programStructureData.drilldown
  });
};

export default {
  id,
  initChart,
  dataFileName
};
