// <div style="min-width: 310px; height: 400px; margin: 0 auto;" id="NCI-Chart__management-fund"></div>

const id = 'NCI-Chart__management-fund';

function initChart(Chart) {
  new Chart(id, {
    chart: {
      type: 'NCI_pie'
    },
    title: { text: 'NIH Management Fund, Service & Supply Fund, and GSA Rent' },
    subtitle: { text: 'Fiscal Year 2021' },
    series: [{
      name: 'Amount',
      data: [
        { name: 'NCI', y: 453495464, drilldown: 'NCI' },
        { name: 'All Others', y: 1819830999 }
      ]
    }],
    drilldown: {
      series: [
        {
          name: 'NCI',
          id: 'NCI',
          data: [
            ['Clinical Center', 172120358],
            ['Center for Scientific Review', 22765248],
            ['Center for Information Technology', 40262648],
            ['Service and Supply Fund Assessment', 205569289],
            ['Other Research Services', 12777921],
            ['Other OD', 0]
          ]
        }
      ]
    }
  });

};

export default {
  id,
  initChart,
};
