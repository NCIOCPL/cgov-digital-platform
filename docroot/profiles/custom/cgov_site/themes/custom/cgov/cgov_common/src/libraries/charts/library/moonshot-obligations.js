// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__moonshot-obligations"></div>

const id = 'NCI-Chart__moonshot-obligations';

function initChart(Chart) {
  new Chart(id, {
    chart: { type: 'NCI_pie' },
    title: { text: 'FY 2021 Cancer Moonshot and Carryover - Obligations by Mechanism' },
    subtitle: { text: 'Fiscal Year 2021' },
    series: [{
      name: 'Budget',
      data: [{ name: 'Research Grants', y: 122936908, drilldown: 'Research Grants' }, { name: 'Intramural Research', y: 49648875 }, { name: 'R&D Contracts', y: 33650007, drilldown: 'R&D Contracts' }, { name: 'Research Management & Support', y: 0 }]
    }],

    drilldown: {
      series:

        [{
          name: 'Research Project Grants', id: 'Research Grants',

          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],

          data: [['RPGs', 67839884], ['Centers', 26374615], ['Other Research', 28722409]]
        },

        {
          name: 'R&D Contract', id: 'R&D Contracts',

          colors: ['#FF5F00', '#FFBF99'],

          data: [['R&D Contracts', 27393003], ['SBIR/STTR Contracts', 6257004]]
        },
        ]
    }
  });
};

export default {
  id,
  initChart,
};
