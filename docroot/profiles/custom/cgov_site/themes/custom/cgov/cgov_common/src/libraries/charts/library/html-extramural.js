// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__html-extramural"></div>

const id = 'NCI-Chart__html-extramural';

function initChart(Chart) {
    new Chart(id, {
      chart: { type: 'NCI_pie' },
      title: { text: 'Extramural Funds' },
      subtitle: { text: 'Fiscal Year 2020' },
      series: [{
        name: 'Budget',
        data: [{
          name: 'Contracts',
          y: 853012066,
          drilldown: 'Contracts'
        }, {
          name: 'Grants',
          y: 4007697995,
          drilldown: 'Grants'
        }]
      }],
      drilldown: {
        series: [{
          name: 'Contracts',
          id: 'Contracts',
          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],
          data: [['Research & Development (R&D) Contracts', 823012066], ['Buildings and Facilities', 30000000], ['Construction Contracts', 0]]
        }, {
          name: 'Grants',
          id: 'Grants',
          colors: ['#80378B', '#602968', '#B387B9', '#532C68', '#D0B9D7', '#5A4F79', '#DCD5E1', '#995FA2'],
          data: [['Research Project Grants (RPGs)', 2749367903], ['Centers/Specialized Centers/SPORES', 613771451], ['NRSA', 96424956], ['Other Research Grants', 548133685]]
        }]
      }
    });
};

export default {
  id,
  initChart,
};
