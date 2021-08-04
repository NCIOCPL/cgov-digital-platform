// <style type='text/css'>@media only screen and (max-width: 640px) {#NCI-Chart__rpg-funding{height:600px !important}}</style>
// <div style="min-width: 310px; height: 450px; margin: 0 auto;" id="NCI-Chart__rpg-funding"></div>

const id = 'NCI-Chart__rpg-funding';

function initChart(Chart) {
  new Chart(id, {
    chart: {
      type: 'NCI_pie'
    },
    plotOptions: {
      pie: {
        size: '75%'
      }
    },
    colors: ['#80378B', '#602968', '#B387B9', '#532C68', '#D0B9D7', '#5A4F79', '#DCD5E1', '#995FA2'],
    title: { text: 'Percent Share of Total RPG Funds, FY 20' },
    series: [{
      name: 'Funding',
      data: [
        ['R01/R37', 1626674],
        ['P01 Program Projects', 187766],
        ['R03 Small Grants', 11688],
        ['R21 Exploratory Phase I', 92517],
        ['R33 Exploratory Phase II', 19351],
        ['R35', 145771],
        ['SBIR/STTR', 151140],
        ['Other', 442295]
      ]
    }],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 596
        },
        chartOptions: {
          chart: { height: 600 },
          legend: {
            layout: 'horizontal',
            itemWidth: 150
          }
        }
      },{
        condition: {
          minWidth: 597
        },
        chartOptions: {
          chart: { height: 450 }
        }
      }]
    },
  });
}

export default {
  id,
  initChart,
};
