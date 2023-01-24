import $ from 'jQuery';

const dataFileName = 'grants-contracts';
const id = 'NCI-Chart__grants-contracts';

function initChart(Chart, grantsContractData) {


  let dialogOffset = 0;
  const mapData = grantsContractData.series[0].data;
  const tooltipObj = grantsContractData.tooltip;

// store all our modal popups for manipulation later
  var popups = [];

  function repositionModals(e) {
    var windowWidth = window.document.body.getBoundingClientRect().width;
    popups.forEach(function (popup) {
      var popupElement = popup.get(0);
      var popupDimensions = popupElement.getBoundingClientRect();
      var overflowRight = windowWidth - popupDimensions.right;
      if (overflowRight < 0) {
        popup.css({ right: 0, left: 'auto' });
      }
      else {
        popup.css({ right: '', left: Math.floor(popupDimensions.left) + 'px' });
      }
    })
  }

  function buildChartSeries() {
    return [
      {
        ...grantsContractData.series[0],
        point: {
          events: {
            click: function () {

              // if there are institutions for this state then render a PIE chart
              if (this.options.institutions) {

                function renderPieChart(options) {
                  // pie chart drill down showing institutions
                  const modalChart = new Highcharts.Chart({
                    chart: {
                      renderTo: $modal[0],
                      type: 'pie'
                    },
                    colors: [
                      '#40bfa2',
                      '#c434b7',
                      '#fb7830',
                      '#01acc8',
                      '#2A71A4',
                      '#82378C',
                      '#BB0E3C',
                      '#FE9F65',
                      '#7F99B4',
                      '#80DDC2',
                      '#329FBE',
                      '#706E6F',
                      '#1C4A79'
                    ],
                    plotOptions: {
                      pie: {
                        allowPointSelect: isInteractive,
                        cursor: isInteractive ? 'pointer' : 'default',
                        dataLabels: {
                          enabled: true,
                          format: '{point.percentage:.1f}%',
                          distance: 15
                        },
                        point: {
                          events: {
                            legendItemClick: function () {
                              return false; // <== returning false will cancel the default action
                            }
                          }
                        },
                        events: {
                          afterAnimate: function () {
                            var chart = this.chart;
                            var legend = chart.legend;
                            var tooltip = this.chart.tooltip;
                            Object.keys(legend.allItems).forEach(function (
                              key) {
                              var item = legend.allItems[key];
                              item.legendItem.on('mouseover', function (
                                e) {
                                var data = item.series.data[item.index];
                                tooltip.refresh(data);
                              }).on('mouseout', function (e) {
                                tooltip.hide();
                              });
                            });
                          }
                        }
                      }
                    },
                    legend: {
                      enabled: true
                    },
                    title: {
                      text: "Institutions"
                    },
                    subtitle: {
                      text: "Receiving More Than $15 Million in NCI Support",
                      style: {
                        fontFamily: "DIN Regular, Arial, sans-serif",
                        fontSize: '14px',
                        fontWeight: 'normal'
                      }
                    },
                    tooltip: {
                      //pointFormat_old: '{point.code}: ${point.value}',
                      useHTML: true,
                      formatter: function () {
                        var data = this.point.options.drilldown_data.data;
                        var header =
                          '<div style="text-align:center"><div style="font-size:13px;font-weight:bold;margin-bottom:3px">' +
                          this.point.options.name +
                          '</div><table style="border-collapse:collapse;margin:0 auto">';
                        var grants = data[0] && data[0][1] || 0;
                        var contracts = data[1] && data[1][1] || 0;

                        var template =
                          '<tr><td>Grants:</td><td align="right"><b>$' +
                          Highcharts.numberFormat(
                            grants, 0) +
                          '</b></td></tr><tr><td>Contracts:</td><td align="right"><b>$' +
                          Highcharts.numberFormat(
                            contracts, 0) +
                          '</b></td></tr><tr><td style="border-top: 1px solid #000;">Total:</td><td style="border-top: 1px solid #000;" align="right"><b>$' +
                          Highcharts.numberFormat(this.y, 0) +
                          '</b></td></tr>';
                        var footer = '</table></div>';

                        return header + template + footer
                      }

                    },
                    series: [{
                      name: "Total",
                      data: options.institutions,
                      showInLegend: true
                    }]
                  });
                  return modalChart;
                }

                var $modal;
                var modalId = 'institution_' + this.options.code;

                if ($("#" + modalId)[0]) {
                  $modal = $("#" + modalId);
                  if ($modal.dialog("isOpen")) {
                    $modal.dialog("moveToTop");
                  } else {
                    $modal.dialog("open");
                    // window.chart.redraw() not working as expected;
                    //renderPieChart(this.options);
                    //$modal.data("chart").reflow();
                  }

                } else {
                  var $modal = $('<div id="' + modalId + '"></div>')
                    .dialog({
                      title: this.name,
                      minWidth: 400,
                      minHeight: 530,
                      position: {
                        my: "center",
                        at: "center+" + dialogOffset + "px center+" +
                          dialogOffset + "px",
                        of: window
                      },
                      resize: function (event, ui) {
                        $modal.data("chart").reflow();
                      },
                      open: function (event, ui) {
                        if (window.matchMedia("(min-width: 600px)").matches) {
                          dialogOffset += 20;
                        } else {
                          dialogOffset = 0;
                        }
                      }
                    });

                  this.options.institutions.map(function (item) {
                    item.drilldown = null
                  });
                  var isInteractive = this.options.institutions.length > 2;

                  $modal.data("chart", renderPieChart(this.options));
                  var $modalWrapper = $modal.closest('.ui-dialog');
                  popups.push($modalWrapper);
                }
              } else {
                // there are no institutions so render a popup notification
                console.log("no institutions!");
                var $modal;
                var modalId = 'no_institutions';

                if ($("#" + modalId)[0]) {
                  $modal = $("#" + modalId);
                  $modal.dialog("option", { title: this.name });
                  if ($modal.dialog("isOpen")) {
                    $modal.dialog("moveToTop");
                  } else {
                    $modal.dialog("open");
                  }
                } else {
                  var message = "This state does not have any individual university or center receiving more than $15 million in NCI support.";
                  var $modal = $('<div id="' + modalId + '"><p class="no-results-message">' + message + '</p></div>')
                    .dialog({
                      title: this.name,
                      minWidth: 400,
                      minHeight: 200,
                      position: {
                        my: "center",
                        at: "center+" + dialogOffset + "px center+" + dialogOffset + "px",
                        of: window
                      },
                      open: function (event, ui) {
                        if (window.matchMedia("(min-width: 600px)").matches) {
                          dialogOffset += 20;
                        } else {
                          dialogOffset = 0;
                        }
                      }
                    });
                }
              }
            }
          }
        }
      }
    ];
  }

  function buildTooltip() {
    return {
      //pointFormat_old: '{point.code}: ${point.value}',
      useHTML: tooltipObj.useHTML,
      formatter: function () {
        var header = '<div><div style="font-size: 13px;margin-bottom:3px">' + this.point
            .options.state +
          '</div><table style="border-collapse:collapse;margin: 0 auto">';
        var template = '<tr><td>+ tooltipObj.label.grants + (' + this.point.grants.number +
          '): </td><td align="right"><b>$' + Highcharts.numberFormat(this.point.grants
            .amount, 0) + '</b></td></tr><tr><td>+ tooltipObj.label.contracts + (' + this.point.contracts
            .number + '): </td><td align="right"><b>$' + Highcharts.numberFormat(this
            .point.contracts.amount, 0) +
          '</b></td></tr><tr><td style="border-top: 1px solid #000;">' + this.series
            .name +
          ':</td><td style="border-top: 1px solid #000;" align="right"><b>$' +
          Highcharts.numberFormat(this.point.value, 0) + '</b></td></tr>';
        var footer = '</table></div>';

        return header + template + footer
      }
    }
  }

  window.addEventListener('resize', repositionModals);


  $.each(mapData, function () {
    this.code = this.code.toUpperCase();
    // TODO: logarithmic values cannot be 0 or negative numbers
    this.value = this.grants.amount + this.contracts.amount || 0.00001;
  });

  new Chart(id, {
    chart: grantsContractData.chartType,
    title: grantsContractData.chartTitle,
    credits: grantsContractData.credits,
    exporting: grantsContractData.exporting,
    legend: grantsContractData.legend,
    mapNavigation: grantsContractData.mapNavigation,
    colorAxis: grantsContractData.colorAxis,
    responsive: grantsContractData.responsive,
    tooltip: buildTooltip(),
    series: buildChartSeries()
  }); //END new Chart
}

export default {
  id,
  initChart,
  dataFileName
};
