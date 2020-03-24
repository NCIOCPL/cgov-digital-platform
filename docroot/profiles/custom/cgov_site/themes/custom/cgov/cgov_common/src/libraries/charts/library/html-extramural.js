// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__html-extramural"></div>

const id = 'NCI-Chart__html-extramural';

function initChart(Chart) {
    new Chart(id, {
      chart: { type: 'NCI_pie' },
      title: { text: 'Extramural Funds' },
      subtitle: { text: 'Fiscal Year 2019' },
      series: [{
        name: 'Budget',
        data: [{
          name: 'Contracts',
          y: 786095181,
          drilldown: 'Contracts'
        }, {
          name: 'Grants',
          y: 3791406979,
          drilldown: 'Grants'
        }]
      }],
      drilldown: {
        series: [{
          name: 'Contracts',
          id: 'Contracts',
          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],
          data: [['Research & Development (R&D) Contracts', 768095181], ['Buildings and Facilities', 18000000], ['Construction Contracts', 0]]
        }, {
          name: 'Grants',
          id: 'Grants',
          colors: ['#80378B', '#602968', '#B387B9', '#532C68', '#D0B9D7', '#5A4F79', '#DCD5E1', '#995FA2'],
          data: [['Research Project Grants (RPGs)', 2541699571], ['Centers/Specialized Centers/SPORES', 655966379], ['NRSA', 86977607], ['Other Research Grants', 506763422]]
        }]
      }
    });
};

export default {
  id,
  initChart,
};
