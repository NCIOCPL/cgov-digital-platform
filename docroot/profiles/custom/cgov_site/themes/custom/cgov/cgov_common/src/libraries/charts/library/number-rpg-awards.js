// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__number-rpg-awards"></div>

const id = 'NCI-Chart__number-rpg-awards';

function initChart(Chart) {
  new Chart(id, {
    chart: {
      type: 'NCI_column'
    },
    title: { text: 'RPGs Number of Awards' },
    subtitle: { text: 'Fiscal Years 2010 - 2019' },
    plotOptions: {
      series: {
        pointStart: 2010
      }
    },
    xAxis: [{
      type: 'category',
      showEmpty: false,
      title: { text: 'Fiscal Year' }
    }],
    yAxis: {
      title: { text: 'Number of RPGs' },
      max: 4000
    },
    series: [{
      name: 'Competing',
      data: [1387, 1106, 1220, 1095, 1378, 1371, 1365, 1311, 1356, 1336]
    },{
      name: 'Non-Competing',
      data: [3692, 3913, 3801, 3721, 3436, 3396, 3301, 3352, 3424, 3648]
    }]
  });
};

export default {
  id,
  initChart
};
