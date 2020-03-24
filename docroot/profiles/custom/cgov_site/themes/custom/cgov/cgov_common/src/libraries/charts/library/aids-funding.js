// <div style="min-width:310px; height:400px; margin:0 auto;" id="NCI-Chart__aids-funding"></div>

const id = 'NCI-Chart__aids-funding';

function initChart(Chart) {
  new Chart(id, {
    chart: {
      type: 'area'
    },
    title: { text: 'Aids Funding History' },
    subtitle: { text: 'Fiscal Years 1998 - 2019' },
    plotOptions: {
      series: { pointStart: 1998 }
    },
    xAxis: {
      type: 'category',
      showEmpty: false,
      title: { text: 'Fiscal Year' }
    },
    yAxis: { title: { text: 'Funding (Dollars in Thousands)' } },
    series: [{
      name: 'NIH',
      data: [1559071, 1797422, 2005100, 2244160, 2500866, 2718171, 2840384, 2909381, 2902183, 2904536, 2928300, 3019279, 3085597, 3059243, 3076056, 2897865, 2977579, 3000061, 3000061, 3000061, 2995381, 3037300]
    },{
      name: 'NCI',
      data: [225991, 239190, 244145, 237789, 254396, 263442, 266975, 265907, 253666, 253666, 258499, 265882, 272130, 269953, 271692, 261550, 269212, 269660, 266422, 249019, 241234, 241979]
    }]
  });

};

export default {
  id,
  initChart,
};
