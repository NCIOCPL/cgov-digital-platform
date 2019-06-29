// <div id="NCI-Chart__rpg-cost-per-award"></div>

const id = 'NCI-Chart__rpg-cost-per-award';

function initChart(Chart) {
    new Chart(id, {
      chart: {
        type: 'NCI_averageCost'
      },
      title: { text: 'RPGs Average Cost' },
      subtitle: { text: 'Fiscal Years 2009 - 2018' },
      plotOptions: {
        series: {
          pointStart: 2009
        }
      },
      series: [{
        name: 'No. Awards',
        type: 'column',
        yAxis: 0,
        data: [5179, 5079, 5019, 5021, 4816, 4814, 4767, 4666, 4663, 4780]
      }, {
        name: 'Total Funded (thousands)',
        type: 'column',
        yAxis: 1,
        data: [2063038, 2092729, 2088352, 2075295, 1924803, 1939623, 2019000, 2069000, 2195000, 2366530],
        tooltip: {
          valuePrefix: '$'
        }
      }],
      yAxis: [{
        id: 'awards',
        title: {
          text: 'No. Awards',
          style: { color: '#3FBFA2' }
        },
        min: 4000,
        max: 6000,
        labels: {
          formatter: function () {
            return Highcharts.numberFormat(this.value, 0)
          }, style: { color: '#3FBFA2' }
        }
      }, {
        id: 'funding',
        title: {
          text: 'Total Funded (thousands)',
          style: { color: '#984E9B'}
        },
        min: 1500000,
        max: 2250000,
        gridLineWidth: 0,
        labels: {
          formatter: function () {
            return '$' + Highcharts.numberFormat(this.value, 0)
          }, style: { color: '#984E9B'}
        }
      }, {
        id: 'average',
        title: {
          text: 'Average Cost (thousands)',
          style: { color: '#FB792F' }
        },
        min: 350,
        max: 500,
        gridLineWidth: 0,
        opposite: true,
        labels: {
          formatter: function () {
            return '$' + Highcharts.numberFormat(this.value, 0)
          }, style: { color: '#FB792F' }
        }
      }, {
        id: 'perAward',
        gridLineWidth: 0,
        title: {
          text: 'Average Cost (thousands)'
        },
        labels: {
          format: '${value}'
        },
        visible: false
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            yAxis: [{
              labels: {
                formatter: function () {
                  return (this.value / 1000)
                },
                x: -5
              },
              title: {
                text: 'No. Awards',
                margin: 5
              }
            }, {
              labels: {
                formatter: function () {
                  return '$' + (this.value / 1000000)
                },
                x: 5
              },
              title: {
                text: 'Total Funded (thousands)',
                margin: 0
              }
            }, {
              labels: {
                rotation: -60,
                x: 10
              },
              title: {
                margin: 0
              }
            }]
          }
        }]
      }
    });
  };

export default {
  id,
  initChart,
}
