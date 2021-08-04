// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__management-fund"></div>

const id = 'NCI-Chart__management-fund';

function initChart(Chart) {
  new Chart(id,{
      chart: {
          type: 'NCI_pie'
      },
      title: {text: 'NIH Management Fund, Service & Supply Fund, and GSA Rent'},
      subtitle: {text: 'Fiscal Year 2020'},
      series: [{
          name: 'Amount',
          data: [
              {name: 'NCI', y: 408021409, drilldown: 'NCI'},
              {name: 'All Others',y: 1667584649}
          ]
      }],
      drilldown: {
          series: [
              {name: 'NCI',
                id: 'NCI',
                data: [
                  ['Clinical Center', 153676485],
                  ['Center for Scientific Review', 22969143],
                  ['Center for Information Technology', 33534007],
                  ['Service and Supply Fund Assessment', 184918145],
                  ['Other Research Services', 12923630],
                  ['Other OD', 0]
              ]}
          ]
      }
  });

};

export default {
  id,
  initChart,
};
