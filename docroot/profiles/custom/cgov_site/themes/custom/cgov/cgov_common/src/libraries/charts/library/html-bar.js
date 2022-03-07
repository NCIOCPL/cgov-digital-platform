// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__html-bar"></div>

const id = 'NCI-Chart__html-bar';

function initChart(Chart) {
  new Chart(id, {
    chart: { type: 'NCI_column' },
    title: { text: 'Total Number of K Awards' },
    subtitle: { text: 'Fiscal Years 2012 - 2021' },
    plotOptions: { series: { pointStart: 2012 } },
    yAxis: [{
      min: 0,
      max: 600,
      title: {
        text: 'Number of Awards'
      }
    }, {
      min: 0,
      max: 110000000,
      title: {
        text: 'Whole Dollars'
      },
      opposite: true
    }
    ],
    xAxis: {
      title: { text: 'Fiscal Year' }
    },
    tooltip: {
      headerFormat: '<span style="font-size:20px; font-weight:bold">{point.key}</span><div class="flexTable--2cols cellWidths-45-55">'
    },
    series: [{
      name: 'Number of Awards',
      data: [422, 387, 399, 401, 402, 398, 432, 446, 487, 524],
      yAxis: 0
    }, {
      name: 'Whole Dollars',
      data: [73164124, 67524782, 67524833, 68821271, 71600825, 71726936, 78338516, 84991000, 96578000, 102655000],
      yAxis: 1,
      tooltip: {
        valuePrefix: '$'
      }
    }]
  });
};

export default {
  id,
  initChart,
}
