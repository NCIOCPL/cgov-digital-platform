// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__moonshot-obligations"></div>

const id = 'NCI-Chart__moonshot-obligations';

function initChart(Chart){
  new Chart(id, {
    chart: { type: 'NCI_pie' },
    title: { text: 'FY 2018 Cancer Moonshot and Carryover - Obligations by Mechanism' },
    subtitle: { text: 'Fiscal Year 2018' },
    series: [{
      name: 'Budget',
      data: [{ name: 'Research Grants', y: 255818392, drilldown: 'Research Grants' }, { name: 'Intramural Research', y: 4034821 }, { name: 'R&D Contracts', y: 45213737, drilldown: 'R&D Contracts' }, { name: 'Research Management & Support', y: 45222 }

      ]
    }],

    drilldown: {
      series:

        [{
          name: 'Research Project Grants', id: 'Research Grants',

          colors: ['#2DC799', '#ABE9D6', '#229573', '#17644D', '#D5F4EB', '#0B3226'],


          data: [['RPGs', 90610215], ['Centers', 72034421], ['Other Research', 93173756]]
        },

        {
          name: 'R&D Contract', id: 'R&D Contracts',

          colors: ['#FF5F00', '#FFBF99'],

          data: [['R&D Contracts', 38802916], ['SBIR/STTR Contracts', 6410821]]
        },

        ]
    }
  });
};

export default {
  id,
  initChart,
};
