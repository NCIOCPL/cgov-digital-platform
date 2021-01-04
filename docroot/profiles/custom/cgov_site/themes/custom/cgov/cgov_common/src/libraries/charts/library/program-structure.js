// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__program-structure"></div>

const id = 'NCI-Chart__program-structure'

function initChart(Chart) {
  new Chart(id,{
    chart: {
      type: 'NCI_pie'
    },
    title: {text: 'Program Structure'},
    subtitle: {text: 'Fiscal Year 2019'},
    series: [{
      name: 'Budget',
      data: [
        {name: 'Research', y: 4168742930, drilldown: 'Research'},
        {name: 'Resource Development',y: 868183709, drilldown: 'Resource Development'},
        {name: 'Cancer Prevention and Control', y: 349114558},
        {name: 'Program Management and Support',y: 606248711}
      ]
    }],
    drilldown: {
      series: [
        {name: 'Research',
          id: 'Research',
          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],
          data: [
            ['Cancer Causation', 1273601511],
            ['Detection and Diagnosis Research', 574969798],
            ['Treatment Research', 1377327352],
            ['Cancer Biology', 942844269]
          ]},
        {name: 'Resource Development',
          id: 'Resource Development',
          colors: ['#80378B', '#602968', '#B387B9', '#532C68', '#D0B9D7', '#5A4F79', '#DCD5E1', '#995FA2'],
          data: [
            ['Cancer Centers', 655966379],
            ['Research Manpower Development', 194217330],
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
