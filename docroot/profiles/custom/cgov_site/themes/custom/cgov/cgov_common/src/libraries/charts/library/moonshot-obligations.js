// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__moonshot-obligations"></div>

const id = 'NCI-Chart__moonshot-obligations';

function initChart(Chart){
  new Chart(id, {
    chart: { type: 'NCI_pie' },
    title: { text: 'FY 2019 Cancer Moonshot and Carryover - Obligations by Mechanism' },
    subtitle: { text: 'Fiscal Year 2019' },
    series: [{
      name: 'Budget',
      data: [{ name: 'Research Grants', y: 208289710, drilldown: 'Research Grants' }, { name: 'Intramural Research', y: 19695533 }, { name: 'R&D Contracts', y: 30238296, drilldown: 'R&D Contracts' }, { name: 'Research Management & Support', y: 128645 }]
    }],

    drilldown: {
      series:

        [{
          name: 'Research Project Grants', id: 'Research Grants',

          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],


          data: [['RPGs', 98424289], ['Centers', 96354953], ['Other Research', 13510468]]
        },

        {
          name: 'R&D Contract', id: 'R&D Contracts',

          colors: ['#FF5F00', '#FFBF99'],

          data: [['R&D Contracts', 17639644], ['SBIR/STTR Contracts', 12598652]]
        },
        ]
    }
  });
};

export default {
  id,
  initChart,
};
