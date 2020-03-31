// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__rms-funding"></div>

const id = 'NCI-Chart__rms-funding';

function initChart(Chart) {
  new Chart(id, {
    chart: {
      type: 'NCI_bar'
    },
    title: { text: 'Extramural vs Intramural and RMS Funding' },
    subtitle: { text: 'Fiscal Years 2015 - 2019' },
    tooltip: {
      pointFormat: '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>${point.y}</div>'
    },
    plotOptions: {
      series: {
        pointStart: 2015
      }
    },
    xAxis: [{
      type: 'category',
      showEmpty: false,
      title: { text: 'Fiscal Year' }
    }, {
      type: 'category',
      showEmpty: false,
      title: { text: 'Mechanism' }
    }],
    yAxis: {
      title: { text: 'Funding (Dollars in Millions)' }
    },
    series: [{
      name: 'Extramural',
      xAxis: 0,
      data: [
        { y: 3687, drilldown: '2015E' },
        { y: 3911.9, drilldown: '2016E' },
        { y: 4309.7, drilldown: '2017E' },
        { y: 4539.8, drilldown: '2018E' },
        { y: 4577.5, drilldown: '2019E' }
      ]
    },
    {
      name: 'IRP & RMS',
      data: [
        { y: 1265.6, drilldown: '2015I' },
        { y: 1294.3, drilldown: '2016I' },
        { y: 1326.7, drilldown: '2017I' },
        { y: 1387.9, drilldown: '2018I' },
        { y: 1414.8, drilldown: '2019I' }
      ]
    }],
    drilldown: {
      drillUpButton: { position: { y: 40, } },
      series: [ {
        name: '2015 Extramural',
        id: '2015E',
        xAxis: 1,
        data: [
          ['Research Project Grants', 2092.6],
          ['Cancer Centers', 288.7],
          ['SPOREs', 102.7],
          ['Other P50s/P20s', 5.8],
          ['Other Specialized Centers', 112.28],
          ['Other Research Grants', 410.1],
          ['NRSA', 69.8],
          ['R&D Contracts', 597.0],
          ['Buildings & Facilities', 8.0]
        ]
      }, {
        name: '2016 Extramural',
        id: '2016E',
        xAxis: 1,
        data: [
          ['Research Project Grants', 2146.1],
          ['Cancer Centers', 335.0],
          ['SPOREs', 108.2],
          ['Other P50s/P20s', 2.8],
          ['Other Specialized Centers', 99.3],
          ['Other Research Grants', 399.1],
          ['NRSA', 73],
          ['R&D Contracts', 732.3],
          ['Buildings & Facilities', 16]
        ]
      }, {
        name: '2017 Extramural',
        id: '2017E',
        xAxis: 1,
        data: [
          ['Research Project Grants', 2278.4],
          ['Cancer Centers', 313.0],
          ['SPOREs', 111.4],
          ['Other P50s/P20s', 1.3],
          ['Other Specialized Centers', 135.6],
          ['Other Research Grants', 481.9],
          ['NRSA', 77.6],
          ['R&D Contracts', 880.4],
          ['Buildings & Facilities', 30.0]
        ]
      }, {
      name: '2018 Extramural',
        id: '2018E',
        xAxis: 1,
        data: [
          ['Research Project Grants', 2450.6],
          ['Cancer Centers', 331.4],
          ['SPOREs', 115.8],
          ['Other P50s/P20s', 0.0],
          ['Other Specialized Centers', 178.3],
          ['Other Research Grants', 537.9],
          ['NRSA', 82.4],
          ['R&D Contracts', 825.4],
          ['Buildings & Facilities', 18.0]
        ]
      }, {
        name: '2019 Extramural',
        id: '2019E',
        xAxis: 1,
        data: [
          ['Research Project Grants', 2541.7],
          ['Cancer Centers', 337.1],
          ['SPOREs', 110.7],
          ['Other P50s/P20s', 7.4],
          ['Other Specialized Centers', 200.8],
          ['Other Research Grants', 506.8],
          ['NRSA', 87.0],
          ['R&D Contracts', 768.1],
          ['Buildings & Facilities', 18.0]
        ]
      },

       {
        name: '2015 IRP & RMS',
        id: '2015I',
        xAxis: 1,
        data: [
          ['Intramural Research', 843.2],
          ['RMS', 422.5]
        ]
      }, {
        name: '2016 IRP & RMS',
        id: '2016I',
        xAxis: 1,
        data: [
          ['Intramural Research', 894.5],
          ['RMS', 399.8]
        ]
      }, {
 name: '2017 IRP & RMS',
        id: '2017I',
        xAxis: 1,
        data: [
          ['Intramural Research', 899.7],
          ['RMS', 427.0]
        ]
      }, {
        name: '2018 IRP & RMS',
        id: '2018I',
        xAxis: 1,
        data: [
          ['Intramural Research', 945.5],
          ['RMS', 442.4]
        ]
      }, {
          name: '2019 IRP & RMS',
          id: '2019I',
          xAxis: 1,
          data: [
            ['Intramural Research', 964.9],
            ['RMS', 449.9]
          ]
        }]
    }
  });

};

export default {
  id,
  initChart,
};
