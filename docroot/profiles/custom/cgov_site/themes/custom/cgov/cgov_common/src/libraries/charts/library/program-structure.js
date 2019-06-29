// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__program-structure"></div>

const id = 'NCI-Chart__program-structure'

function initChart(Chart) {
  new Chart(id,{
    chart: {
      type: 'NCI_pie'
    },
    title: {text: 'Program Structure'},
    subtitle: {text: 'Fiscal Year 2018'},
    series: [{
      name: 'Budget',
      data: [
        {name: 'Research', y: 4171226787, drilldown: 'Research'},
        {name: 'Resource Development',y: 825564803, drilldown: 'Resource Development'},
        {name: 'Cancer Prevention and Control', y: 338773485},
        {name: 'Program Management and Support',y: 592164029}
      ]
    }],
    drilldown: {
      series: [
        {name: 'Research',
          id: 'Research',
          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],
          data: [
            ['Cancer Causation', 1323606784],
            ['Detection and Diagnosis Research', 590461291],
            ['Treatment Research', 1352652428],
            ['Cancer Biology', 904506284]
          ]},
        {name: 'Resource Development',
          id: 'Resource Development',
          colors: ['#80378B', '#602968', '#B387B9', '#532C68', '#D0B9D7', '#5A4F79', '#DCD5E1', '#995FA2'],
          data: [
            ['Cancer Centers', 625575487],
            ['Research Manpower Development', 181989316],
            ['Buildings and Facilities', 18000000]
          ]}
      ]
    }
  });
};

export default {
  id,
  initChart,
};
