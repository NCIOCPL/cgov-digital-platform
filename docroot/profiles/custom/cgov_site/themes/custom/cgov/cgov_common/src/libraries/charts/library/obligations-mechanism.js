{/* <style type='text/css'>
    @media only screen and(max - width: 640 px) {
        #NCI-Chart_obligations-mechanism {
            height: 600px !important;
        }
    }
</style>
<div style="min-width: 310px; height: 450px; margin: 0 auto;" id="NCI-Chart_obligations-mechanism"></div> */}
import obligationsMechanismData from './data/obligations-mechanism.json';
const id = 'NCI-Chart_obligations-mechanism';

function initChart(Chart) {
  new Chart(id, {
    chart: obligationsMechanismData.chartType,
    plotOptions: obligationsMechanismData.plotOptions,
    colors: obligationsMechanismData.colors,
    title: obligationsMechanismData.chartTitle,
    subtitle: obligationsMechanismData.chartSubTitle,
    series: obligationsMechanismData.series,
    drilldown: obligationsMechanismData.series,
    responsive: obligationsMechanismData.responsive
  });
};


export default {
  id,
  initChart,
}
