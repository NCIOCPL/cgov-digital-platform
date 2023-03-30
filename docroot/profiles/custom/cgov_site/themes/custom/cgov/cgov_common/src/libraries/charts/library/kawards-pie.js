const dataFileName = 'kawards-pie';
const id = 'NCI-Chart__kawards-pie';

function initChart(Chart, kAwardsData) {
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
  dataFileName
}
