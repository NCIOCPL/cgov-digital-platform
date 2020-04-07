// <div style="min-width:310px; height:500px; margin:0 auto;" id="NCI-Chart__html-nrsa"></div>

const id = 'NCI-Chart__html-nrsa';

function initChart(Chart) {
    new Chart(id,
      {
        chart: { type: 'NCI_column' },
        title: { text: 'National Research Service Awards (NRSAs) Predoctoral and Postdoctoral Trainees (Full-Time Trainee Positions)' },
        subtitle: { text: 'Fiscal Years 2010 - 2019' }, plotOptions: { series: { pointStart: 2010 } },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of Trainees'
          },
          labels: {
            formatter: function () { return Highcharts.numberFormat(this.value, 0) }
          }
        },
        xAxis: {
          title: { text: 'Fiscal Year' }
        },
        series:
          [{
            name: 'Predoc',
            data: [476, 464, 497, 587, 664, 699, 722, 744, 715, 771]
          },
          {
            name: 'Postdoc',
            data: [952, 911, 845, 766, 768, 722, 717, 776, 817, 818]
          },
          {
            name: 'Total',
            data: [1428, 1375, 1342, 1353, 1432, 1421, 1439, 1520, 1532, 1589]
          }]
      });
  };

export default {
  id,
  initChart,
}
