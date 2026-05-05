const dataFileName = 'grants-contracts';
const id = 'NCI-Chart__grants-contracts';
/*
  Versioning for map collection included below is handled separately from Highcharts core/modules code
  https://code.highcharts.com/mapdata/
 */
const geoDataURL = 'https://code.highcharts.com/mapdata/countries/us/custom/us-all-territories.topo.json';

function initChart(Chart, data, miscData = {}) {
  let dialogOffset = 0;
  let dialogZIndex = 1000;
  const allocationData = data.series[0].data;
  const tooltipObj = data.tooltip;

// store all our modal popups for manipulation later
  var popups = [];
  var popupById = {};

  function keepPopupInViewport(popup) {
    var popupElement = popup.element;
    var popupDimensions = popupElement.getBoundingClientRect();
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var left = popupDimensions.left;
    var top = popupDimensions.top;

    if (popupDimensions.right > windowWidth) {
      left = Math.max(0, windowWidth - popupDimensions.width);
    }

    if (popupDimensions.left < 0) {
      left = 0;
    }

    if (popupDimensions.bottom > windowHeight) {
      top = Math.max(0, windowHeight - popupDimensions.height);
    }

    if (popupDimensions.top < 0) {
      top = 0;
    }

    popupElement.style.left = Math.floor(left) + 'px';
    popupElement.style.top = Math.floor(top) + 'px';
  }

  function repositionModals() {
    popups.forEach(function (popup) {
      if (popup.isOpen()) {
        keepPopupInViewport(popup);
      }
    });
  }

  function getDialogOffset() {
    if (window.matchMedia("(min-width: 600px)").matches) {
      var offset = dialogOffset;
      dialogOffset += 20;
      return offset;
    }

    dialogOffset = 0;
    return 0;
  }

  function movePopupToTop(popup) {
    popup.element.style.zIndex = dialogZIndex++;
  }

  function positionPopup(popup, offset) {
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var width = Math.min(popup.minWidth, Math.floor(windowWidth * 0.93));

    popup.element.style.width = width + 'px';

    var popupDimensions = popup.element.getBoundingClientRect();
    var left = Math.max(0, ((windowWidth - popupDimensions.width) / 2) + offset);
    var top = Math.max(0, ((windowHeight - popupDimensions.height) / 2) + offset);

    popup.element.style.left = Math.floor(left) + 'px';
    popup.element.style.top = Math.floor(top) + 'px';
    keepPopupInViewport(popup);
  }

  function makePopupDraggable(popup, titlebar) {
    titlebar.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || event.target.closest('button')) {
        return;
      }

      event.preventDefault();
      movePopupToTop(popup);

      var popupDimensions = popup.element.getBoundingClientRect();
      var startX = event.clientX;
      var startY = event.clientY;
      var startLeft = popupDimensions.left;
      var startTop = popupDimensions.top;

      function drag(event) {
        popup.element.style.left = Math.floor(startLeft + event.clientX - startX) + 'px';
        popup.element.style.top = Math.floor(startTop + event.clientY - startY) + 'px';
        keepPopupInViewport(popup);
      }

      function stopDragging() {
        document.removeEventListener('pointermove', drag);
        document.removeEventListener('pointerup', stopDragging);
      }

      document.addEventListener('pointermove', drag);
      document.addEventListener('pointerup', stopDragging);
    });
  }

  function observePopupResize(popup) {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    var animationFrame;
    var observer = new ResizeObserver(function () {
      if (!popup.chart) {
        return;
      }

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(function () {
        popup.chart.reflow();
      });
    });

    observer.observe(popup.content);
  }

  function createPopup(options) {
    var popupElement = document.createElement('div');
    var titlebar = document.createElement('div');
    var titleElement = document.createElement('span');
    var closeButton = document.createElement('button');
    var closeIcon = document.createElement('span');
    var closeText = document.createElement('span');
    var content = document.createElement('div');
    var titleId = options.id + '_title';
    var contentMinHeight = Math.max(0, options.minHeight - 48);

    popupElement.className = 'ui-dialog ui-corner-all ui-widget ui-widget-content ui-front cgdp-highcharts-dialog';
    popupElement.setAttribute('role', 'dialog');
    popupElement.setAttribute('aria-labelledby', titleId);
    popupElement.setAttribute('aria-modal', 'false');
    popupElement.hidden = true;
    popupElement.style.minHeight = options.minHeight + 'px';

    titlebar.className = 'ui-dialog-titlebar ui-corner-all ui-widget-header ui-helper-clearfix';

    titleElement.className = 'ui-dialog-title';
    titleElement.id = titleId;
    titleElement.textContent = options.title;

    closeButton.className = 'ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close';
    closeButton.type = 'button';
    closeButton.title = 'Close';

    closeIcon.className = 'ui-button-icon ui-icon ui-icon-closethick';
    closeText.className = 'ui-button-icon-space';
    closeText.textContent = 'Close';

    content.id = options.id;
    content.className = 'ui-dialog-content ui-widget-content';
    content.style.minHeight = contentMinHeight + 'px';

    closeButton.appendChild(closeIcon);
    closeButton.appendChild(closeText);
    titlebar.appendChild(titleElement);
    titlebar.appendChild(closeButton);
    popupElement.appendChild(titlebar);
    popupElement.appendChild(content);
    document.body.appendChild(popupElement);

    var popup = {
      element: popupElement,
      content: content,
      minWidth: options.minWidth,
      chart: null,
      isOpen: function () {
        return !popupElement.hidden;
      },
      open: function () {
        popupElement.hidden = false;
        popupElement.setAttribute('aria-hidden', 'false');
        movePopupToTop(popup);
        positionPopup(popup, getDialogOffset());
      },
      close: function () {
        popupElement.hidden = true;
        popupElement.setAttribute('aria-hidden', 'true');
      },
      moveToTop: function () {
        movePopupToTop(popup);
      },
      setTitle: function (title) {
        titleElement.textContent = title;
      },
      setChart: function (chart) {
        popup.chart = chart;
      }
    };

    closeButton.addEventListener('click', popup.close);
    popupElement.addEventListener('mousedown', popup.moveToTop);
    makePopupDraggable(popup, titlebar);
    observePopupResize(popup);

    popups.push(popup);
    popupById[options.id] = popup;

    return popup;
  }

  function buildChartSeries() {
    return [
      {
        ...data.series[0],
        point: {
          events: {
            click: function () {

              // if there are institutions for this state then render a PIE chart
              if (this.options.institutions) {

                function renderPieChart(options, renderTo, isInteractive) {
                  // pie chart drill down showing institutions
                  const modalChart = new Highcharts.Chart({
                    chart: {
                      renderTo: renderTo,
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
                          mouseOver: function () {
                            const chart = this.chart;
                            const legend = chart.legend;
                            const tooltip = this.chart.tooltip;
                            Object.keys(legend.allItems).forEach(function (key) {
                              const item = legend.allItems[key];
                              const data = item.series.data[item.index];
                              tooltip.refresh(data);
                            });
                          },
                          mouseOut: function() {
                            this.chart.tooltip.hide();
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
                          '<tr><td>Grants:</td><td style="text-align:center"><b>$' +
                          Highcharts.numberFormat(
                            grants, 0) +
                          '</b></td></tr><tr><td>Contracts:</td><td style="text-align:center"><b>$' +
                          Highcharts.numberFormat(
                            contracts, 0) +
                          '</b></td></tr><tr><td style="border-top: 1px solid #000;">Total:</td><td style="border-top: 1px solid #000;text-align:center"><b>$' +
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

                var modalId = 'institution_' + this.options.code;
                var popup = popupById[modalId];

                if (popup) {
                  if (popup.isOpen()) {
                    popup.moveToTop();
                  } else {
                    popup.open();
                    popup.chart.reflow();
                  }

                } else {
                  popup = createPopup({
                    id: modalId,
                    title: this.name,
                    minWidth: 400,
                    minHeight: 530
                  });
                  popup.open();

                  this.options.institutions.forEach(function (item) {
                    item.drilldown = null
                  });
                  var isInteractive = this.options.institutions.length > 2;

                  popup.setChart(renderPieChart(this.options, popup.content, isInteractive));
                }
              } else {
                // there are no institutions so render a popup notification
                var modalId = 'no_institutions';
                var popup = popupById[modalId];

                if (popup) {
                  popup.setTitle(this.name);
                  if (popup.isOpen()) {
                    popup.moveToTop();
                  } else {
                    popup.open();
                  }
                } else {
                  var message = "This state/territory does not have any individual university or center receiving more than $15 million in NCI support.";
                  var messageElement = document.createElement('p');

                  popup = createPopup({
                    id: modalId,
                    title: this.name,
                    minWidth: 400,
                    minHeight: 200
                  });
                  messageElement.className = 'no-results-message';
                  messageElement.textContent = message;
                  popup.content.appendChild(messageElement);
                  popup.open();
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
      useHTML: tooltipObj.useHTML,
      formatter: function () {
        var header = '<div><div style="font-size: 13px;margin-bottom:3px">' + this.point
            .options.state +
          '</div><table style="border-collapse:collapse;margin: 0 auto">';
        var template = '<tr><td>' + tooltipObj.label.grants + ' (' + this.point.grants.number +
          '): </td><td style="text-align: right;"><b>$' + Highcharts.numberFormat(this.point.grants
            .amount, 0) + '</b></td></tr><tr><td>' + tooltipObj.label.contracts + ' (' + this.point.contracts
            .number + '): </td><td style="text-align: right;"><b>$' + Highcharts.numberFormat(this
            .point.contracts.amount, 0) +
          '</b></td></tr><tr><td style="border-top: 1px solid #000;">' + this.series
            .name +
          ':</td><td style="border-top: 1px solid #000;text-align: right"><b>$' +
          Highcharts.numberFormat(this.point.value, 0) + '</b></td></tr>';
        var footer = '</table></div>';

        return header + template + footer
      }
    }
  }

  window.addEventListener('resize', repositionModals);


  allocationData.forEach(function (allocation) {
    allocation.code = allocation.code.toUpperCase();
    // TODO: logarithmic values cannot be 0 or negative numbers
    allocation.value = allocation.grants.amount + allocation.contracts.amount || 0.00001;
  });

  const chartType = { map: miscData, ...data.chartType };

  new Chart(id, {
    chart: chartType,
    title: data.chartTitle,
    credits: data.credits,
    legend: data.legend,
    mapNavigation: data.mapNavigation,
    colorAxis: data.colorAxis,
    responsive: data.responsive,
    tooltip: buildTooltip(),
    series: buildChartSeries()
  });
}

export default {
  id,
  initChart,
  dataFileName,
  miscDataURL: geoDataURL
};
