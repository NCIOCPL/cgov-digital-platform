// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__management-fund"></div>

const id = 'NCI-Chart__management-fund';

function initChart(Chart) {
  new Chart(id,{
      chart: {
          type: 'NCI_pie'
      },
      title: {text: 'NIH Management Fund, Service & Supply Fund, and GSA Rent'},
      subtitle: {text: 'Fiscal Year 2019'},
      series: [{
          name: 'Amount',
          data: [
              {name: 'NCI', y: 394852398, drilldown: 'NCI'},
              {name: 'All Others',y: 1589193079}
          ]
      }],
      drilldown: {
          series: [
              {name: 'NCI',
                id: 'NCI',
                data: [
                  ['Clinical Center', 146225820],
                  ['Center for Scientific Review', 26444914],
                  ['Center for Information Technology', 30690142],
                  ['Service and Supply Fund Assessment', 178058636],
                  ['Other Research Services', 13432885],
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
