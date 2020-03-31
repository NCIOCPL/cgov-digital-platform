// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__compare-html-amount"></div>

const id = 'NCI-Chart__compare-html-amount';

function initChart(Chart) {
  new Chart(id, {
    chart: { type: 'line' },
    title: { text: 'Comparison of Dollars, Positions, and Space' },
    subtitle: { text: 'Fiscal Years 2010 - 2019' }, plotOptions: { series: { pointStart: 2010 } },
    yAxis: [{
      title: { text: 'Funds (millions)', style: { color: '#40bfa2' } },
      labels: {
        formatter: function () { return '$' + this.value / 1000 + 'M' },
        style: { color: '#40bfa2' }
      },
      min: 3800, max: 5700
    }, {
      title: { text: 'Space (Sq Ft)', style: { color: '#984e9b' }, margin: 0 }, labels: {
        formatter: function () { return this.value / 1000 + 'M' },
        style: { color: '#984e9b' }, x: 5
      }, opposite: true, min: 800, max: 1200
    }, {
      title: {
        text: 'FTEs',
        style: { color: '#fb7830' },
        margin: 5
      },
      labels: {
        style: { color: '#fb7830' }, x: 10,
        formatter: function () { return Highcharts.numberFormat(this.value, 0) }
      },
      opposite: true, min: 2500, max: 4500
    }],
    tooltip: { crosshairs: true, shared: true },

    series: [{
      name: 'Funds',
      yAxis: 0,
      data: [5098, 5058, 5067, 4789, 4932, 4953, 5206, 5636,5928, 5992],
      tooltip: { valuePrefix: '$', valueSuffix: ',000' }
    }, {
      name: 'Space (Sq Ft)',
      yAxis: 1,
      data: [983, 952, 952, 1072, 992, 1011, 1001, 1004, 1019, 1055],
      tooltip: { pointFormat: '<span style="color:{point.color}">\u25CF</span> Space: {point.y}<br/>' }
    }, {
      name: 'FTEs',
      yAxis: 2,
      data: [3056, 3135, 3136, 3103, 3040, 2998, 2962, 3029, 2952, 2888]
    }]
  });
};

export default {
  id,
  initChart,
};
