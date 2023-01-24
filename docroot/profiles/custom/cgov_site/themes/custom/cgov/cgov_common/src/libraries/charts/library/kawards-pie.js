{/* <style type="text/css">
  @media only screen and (max-width: 725px) {
    #NCI-Chart__kawards-pie {
      height: 800px !important
    }
  }
</style>
<div style="min-width:310px; height:600px; margin:0 auto;" id="NCI-Chart__kawards-pie"></div> */}
import kAwardsData from './data/kawards-pie.json';
const id = 'NCI-Chart__kawards-pie';

function initChart(Chart) {
  new Chart(id, {
    colors: kAwardsData.colors,
    chart: kAwardsData.chartType,
    title: kAwardsData.chartTitle,
    subtitle: kAwardsData.chartSubTitle,
    legend: {
      ...kAwardsData.legend, labelFormatter: function () {
        var legendName = this.name;
        var match = legendName.match(/\b.{0,37}\b/g);
        return match.toString().replace(/\,/g, "<br/>");
      }
    },
    responsive: kAwardsData.responsive,
    series:kAwardsData.series
  });
};

export default {
  id,
  initChart,
}
