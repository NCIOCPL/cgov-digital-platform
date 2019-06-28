{/* <style type="text/css">
  @media only screen and (max-width: 725px) {
    #NCI-Chart__kawards-pie {
      height: 800px !important
    }
  }
</style>
<div style="min-width:310px; height:600px; margin:0 auto;" id="NCI-Chart__kawards-pie"></div> */}

const id = 'NCI-Chart__kawards-pie';

function initChart(Chart) {
  new Chart(id, {
    colors: ['#1B5768', '#70858C', '#E2F0F4', '#83C5D8', '#319FBE', '#123A46', '#5090A2', '#00181D', '#5AB2CB', '#24748B'],
    chart: { type: 'NCI_pie' },
    title: { text: 'Percent of Total Research Career Awards Funded' },
    subtitle: { text: 'Fiscal Year 2018' },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemWidth: 200,
      labelFormatter: function () {
        var legendName = this.name;
        var match = legendName.match(/\b.{0,37}\b/g);
        return match.toString().replace(/\,/g, "<br/>");
      }
    },
    responsive: {
      rules: [{
        condition: {
          minWidth: 680
        },
        chartOptions: {
          chart: { height: 600 }
        }
      }, {
        condition: {
          maxWidth: 679
        },
        chartOptions: {
          chart: { height: 800 },
          legend: {
            layout: 'vertical',
            align: 'center',
            verticalAlign: 'bottom',
            itemWidth: null,
            labelFormatter: function () { return this.name }
          }
        }
      }]
    },
    series: [{
      name: 'Funding',
      data: [
        ['K00 Post-Doc-Fellow Awards', 2294],
        ['K01 Research Scientist Development Award', 5826],
        ['K05 Research Scientist Award', 444],
        ['K07 Preventive Oncology', 11272],
        ['K08 Clinical Investigator', 20858],
        ['K12 Institutional Clinical Oncology Research', 14228],
        ['K22 Transitional Career Development', 10304],
        ['K23 Patient-Oriented Career', 2166],
        ['K24 Patient-Oriented Career - Mid Career', 2380],
        ['K25 Mentored Quantitative Research Career Development Award', 847],
        ['K43 Mentored Career Devel/Temin Intl Career', 154],
        ['K99 NIH Pathway to Independence Awards', 7564]
      ]
    }]
  });
};

export default {
  id,
  initChart,
}
