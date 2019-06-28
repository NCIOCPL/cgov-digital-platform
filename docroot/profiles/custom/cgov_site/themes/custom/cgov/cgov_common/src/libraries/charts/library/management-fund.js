// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__management-fund"></div>

const id = 'NCI-Chart__management-fund';

function initChart(Chart) {
  new Chart(id,{
      chart: {
          type: 'NCI_pie'
      },
      title: {text: 'NIH Management Fund, Service & Supply Fund, and GSA Rent'},
      subtitle: {text: 'Fiscal Year 2018'},
      series: [{
          name: 'Amount',
          data: [
              {name: 'NCI', y: 369327642, drilldown: 'NCI'},
              {name: 'All Others',y: 1512273171}
          ]
      }],
      drilldown: {
          series: [
              {name: 'NCI',
                id: 'NCI',
                data: [
                  ['Clinical Center', 137441910],
                  ['Center for Scientific Review', 26186932],
                  ['Center for Information Technology', 7509131],
                  ['Service and Supply Fund Assessment', 184485965],
                  ['Other Research Services', 13703703],
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
