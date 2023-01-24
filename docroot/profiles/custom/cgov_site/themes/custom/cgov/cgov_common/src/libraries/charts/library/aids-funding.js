// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__aids-funding"></div>
import aidsFundingData from './data/aids-funding.json';
const id = 'NCI-Chart__aids-funding';

function initChart(Chart) {
  new Chart(id, {
    chart: aidsFundingData.chartType,
    title: aidsFundingData.chartTitle,
    subtitle: aidsFundingData.chartSubTitle,
    plotOptions: aidsFundingData.plotOptions,
    xAxis: aidsFundingData.xAxis,
    yAxis: aidsFundingData.yAxis,
    series: aidsFundingData.series
  });

};

export default {
  id,
  initChart,
};
