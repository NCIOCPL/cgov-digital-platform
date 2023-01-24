// <style type='text/css'>@media only screen and (max-width: 640px) {#NCI-Chart__rpg-funding{height:600px !important}}</style>
// <div style="min-width: 310px; height: 450px; margin: 0 auto;" id="NCI-Chart__rpg-funding"></div>
import rpgFundingData from './data/rpg-funding.json';
const id = 'NCI-Chart__rpg-funding';

function initChart(Chart) {
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
};
