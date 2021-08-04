// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__moonshot-obligations"></div>

const id = 'NCI-Chart__moonshot-obligations';

function initChart(Chart){
  new Chart(id, {
    chart: { type: 'NCI_pie' },
    title: { text: 'FY 2020 Cancer Moonshot and Carryover - Obligations by Mechanism' },
    subtitle: { text: 'Fiscal Year 2020' },
    series: [{
      name: 'Budget',
      data: [{ name: 'Research Grants', y: 115588154, drilldown: 'Research Grants' }, { name: 'Intramural Research', y: 17469326 }, { name: 'R&D Contracts', y: 31634416, drilldown: 'R&D Contracts' }, { name: 'Research Management & Support', y: 87434 }]
    }],

    drilldown: {
      series:

        [{
          name: 'Research Project Grants', id: 'Research Grants',

          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],

          data: [['RPGs', 59874700], ['Centers', 32197392], ['Other Research', 23516062]]
        },

        {
          name: 'R&D Contract', id: 'R&D Contracts',

          colors: ['#FF5F00', '#FFBF99'],

          data: [['R&D Contracts', 26256370], ['SBIR/STTR Contracts', 5378046]]
        },
        ]
    }
  });
};

export default {
  id,
  initChart,
};
