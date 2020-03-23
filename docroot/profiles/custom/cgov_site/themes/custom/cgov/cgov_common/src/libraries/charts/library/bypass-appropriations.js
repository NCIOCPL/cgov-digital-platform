// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__appropriations"></div>

const id = 'NCI-Chart__appropriations';

function initChart(Chart) {
  new Chart(id, {
    chart: {
      type: 'line'
    },
    title: { text: 'Bypass Requests and NCI Appropriations' },
    subtitle: { text: 'Fiscal Years 1974 - 2021' },
    xAxis: {

      labels: {
        align: 'center'
      },
      title: { text: 'Fiscal Year' }
    },
    plotOptions: {
      series: { pointStart: 1974 }
    },
    yAxis: { title: { text: 'Dollars in Thousands' }, max: 7500000 },
    series: [{
      name: 'Bypass',
      data: [640031, 750000, 898500, 948000, 955000, 1036000, 1055000, 1170000, 1192000, 1197000, 1074000, 1189000, 1460000, 1570000, 1700000, 2080000, 2195000, 2410000, 2612000, 2775000, 3200000, 3600000, 3640000, 2977000, 2702500, 3191000, 3873000, 4135000, 5030000, 5690000, 5986000, 6211000, 6170000, 5949714, 5865788, 6028386, 7193393, 6199666, 5869857, 5833010, null, null, 5754000, 5453000, null, 6380000, 6522000, 6928000]
    }, {
      name: 'Appropriated',
      data: [551192, 691666, 914628, 815000, 872388, 937129, 1000000, 989355, 986617, 987642, 1081581, 1183806, 1264159, 1402837, 1469327, 1593536, 1664000, 1766324, 1989278, 2007483, 2082267, 2135119, 2251084, 2382532, 2547314, 2927187, 3332317, 3757242, 4190405, 4622394, 4770519, 4865525, 4841774, 4797639, 4890525, 4968973, 5103388, 5103388, 5081788, 5072183, 4923238, 4950396, 5214701, 5689329, 5964800,6143892, null, null]
    }],
    tooltip: {
      shared: true,
      useHTML: true,
      crosshairs: true
    }
  });
};

export default {
  id,
  initChart,
}
