// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__program-structure"></div>
import programStructureData from './data/program-structure.json';
const id = 'NCI-Chart__program-structure'

function initChart(Chart) {
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
};
