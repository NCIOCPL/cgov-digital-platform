const dataFileName = 'rpg-funding';
const id = 'NCI-Chart__rpg-funding';

function initChart(Chart, rpgFundingData) {
  new Chart(id, {
    chart: rpgFundingData.chartType,
    plotOptions: rpgFundingData.plotOptions,
    colors: rpgFundingData.colors,
    title: rpgFundingData.chartTitle,
    series: rpgFundingData.series,
    responsive: rpgFundingData.responsive,
  });
}

export default {
  id,
  initChart,
  dataFileName
};
