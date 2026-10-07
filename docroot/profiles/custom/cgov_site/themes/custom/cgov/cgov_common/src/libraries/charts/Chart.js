/**
 * NCI wrapper around Highcharts.
 *
 * The chart system is split across a small set of modules:
 *
 * a) index.js is the page-level coordinator. It imports chart.scss, checks route
 * rules before doing DOM work, finds registered chart containers, fetches the
 * chart JSON from the configured Fact Book data endpoint, and preloads shared
 * Highcharts assets while data requests are in flight.
 *
 * b) library/*.js files are chart adapters. Each one maps a data file and a DOM
 * id to an initChart function, transforms the fetched JSON into Highcharts
 * options when needed, and instantiates this wrapper.
 *
 * c) This file owns the rendering layer. It lazy-loads Highcharts core and
 * modules from the pinned CDN version, shares those script-load Promises across
 * chart instances, applies the NCI theme/defaults, merges chart-specific
 * options, and creates either a built-in Highcharts chart or one of the legacy
 * NCI_* chart presets below.
 *
 * Important implementation constraints:
 *
 * a) Highcharts still attaches itself to window. This wrapper treats that global
 * as the integration point while keeping script loading centralized and
 * idempotent.
 *
 * b) Module load order affects Highcharts defaults. Shared modules load first;
 * chart-specific modules such as maps and drilldown load before rendering; the
 * accessibility module loads last, as recommended by Highcharts.
 *
 * c) Existing Fact Book charts depend on wrapper-level theme defaults and the
 * legacy NCI_* presets. New adapters should pass plain Highcharts options and
 * leave library loading, theme application, and error propagation to this file.
 */

// Pinned Highcharts asset URLs loaded on demand by chart instances.
const highchartsVersion = '11.4.0';
const highchartsBaseURL = 'https://code.highcharts.com/' + highchartsVersion;
const highchartsMapsBaseURL =
  'https://code.highcharts.com/maps/' + highchartsVersion;
const highchartsScripts = {
  core: highchartsBaseURL + '/highcharts.js',
  exporting: highchartsBaseURL + '/modules/exporting.js',
  offlineExporting: highchartsBaseURL + '/modules/offline-exporting.js',
  accessibility: highchartsBaseURL + '/modules/accessibility.js',
  drilldown: highchartsBaseURL + '/modules/drilldown.js',
  map: highchartsMapsBaseURL + '/modules/map.js',
};

const highchartsScriptPromises = {};
let highchartsCorePromise;
let highchartsBasePromise;

/**
 * Return the global Highcharts object after the CDN scripts have attached it.
 */
function getHighcharts() {
  return window.Highcharts;
}

/**
 * Check whether a value can be recursively merged as a simple object.
 */
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Prevent prototype pollution keys from being assigned during deep merges.
 */
function isSafeMergeKey(key) {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

/**
 * Recursively merge chart configuration objects while preserving arrays and functions.
 */
function deepMerge(target, ...sources) {
  sources.forEach(function (source) {
    if (!source) {
      return;
    }

    Object.keys(source).forEach(function (key) {
      if (
        !Object.prototype.hasOwnProperty.call(source, key) ||
        !isSafeMergeKey(key)
      ) {
        return;
      }

      const copy = source[key];

      if (copy === target || typeof copy === 'undefined') {
        return;
      }

      if (Array.isArray(copy)) {
        target[key] = deepMerge(
          Array.isArray(target[key]) ? target[key] : [],
          copy
        );
      } else if (isPlainObject(copy)) {
        target[key] = deepMerge(
          isPlainObject(target[key]) ? target[key] : {},
          copy
        );
      } else {
        target[key] = copy;
      }
    });
  });

  return target;
}

/**
 * Load a remote script once and share the same Promise with every chart instance.
 */
function loadScript(url) {
  if (!highchartsScriptPromises[url]) {
    highchartsScriptPromises[url] = new Promise(function (resolve, reject) {
      const script = document.createElement('script');

      script.async = true;
      script.src = url;

      script.addEventListener('load', function () {
        resolve(getHighcharts());
      });

      script.addEventListener('error', function () {
        delete highchartsScriptPromises[url];
        reject(new Error('Unable to load Highcharts script "' + url + '".'));
      });

      document.head.appendChild(script);
    });
  }

  return highchartsScriptPromises[url];
}

/**
 * Load Highcharts core, or reuse the existing global if another script already loaded it.
 */
function loadHighchartsCore() {
  if (getHighcharts()) {
    return Promise.resolve(getHighcharts());
  }

  if (!highchartsCorePromise) {
    highchartsCorePromise = loadScript(highchartsScripts.core)
      .then(function () {
        return getHighcharts();
      })
      .catch(function (error) {
        highchartsCorePromise = null;
        throw error;
      });
  }

  return highchartsCorePromise;
}

/**
 * Load modules required by every chart before chart-specific modules are requested.
 */
function loadHighchartsBase() {
  if (!highchartsBasePromise) {
    highchartsBasePromise = loadHighchartsCore()
      .then(function () {
        return loadScript(highchartsScripts.exporting);
      })
      .then(function () {
        return loadScript(highchartsScripts.offlineExporting);
      })
      .then(function () {
        return getHighcharts();
      })
      .catch(function (error) {
        highchartsBasePromise = null;
        throw error;
      });
  }

  return highchartsBasePromise;
}

/**
 * Determine whether the chart settings need the Highcharts drilldown module.
 */
function hasDrilldownSeries(settings) {
  return (
    settings.drilldown &&
    Array.isArray(settings.drilldown.series) &&
    settings.drilldown.series.length > 0
  );
}

/**
 * Determine whether the chart settings need the Highcharts map module.
 */
function isMapChart(settings) {
  return settings.chart && settings.chart.type === 'map';
}

/**
 * Load Highcharts core, shared modules, and any modules required by this chart.
 */
function loadHighcharts(settings = {}) {
  return loadHighchartsBase()
    .then(function () {
      const additionalModules = [];

      if (hasDrilldownSeries(settings)) {
        additionalModules.push(loadScript(highchartsScripts.drilldown));
      }

      if (isMapChart(settings)) {
        additionalModules.push(loadScript(highchartsScripts.map));
      }

      return Promise.all(additionalModules);
    })
    .then(function () {
      // Highcharts recommends loading accessibility after other modules.
      return loadScript(highchartsScripts.accessibility);
    })
    .then(function () {
      return getHighcharts();
    });
}

/**
 * Build the NCI chart wrapper settings and immediately start initialization.
 */
function Chart(target, options) {
  this.defaultSettings = {
    type: 'pie',
    colors: [
      '#40bfa2',
      '#984e9b',
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
      '#1C4A79',
    ],
    bgColors: ['#ffffff', '#f0f0ff'],
    font: {
      dinCon: 'DIN Condensed, Arial Narrow, Arial, sans-serif',
      din: 'DIN Regular, Arial, sans-serif',
      museo: 'Museo, Montserrat, Arial, sans-serif',
    },
    title: {
      color: '#62559f',
    },
    subtitle: {
      color: '#62559f',
    },
    drilldown: {},
  };

  // Clone defaults before merging adapter options; several presets mutate settings.
  this.settings = deepMerge({}, this.defaultSettings, options);
  this.settings.target = target;

  this.ready = this.init();
}

/**
 * Begin loading shared Highcharts assets before chart data is ready.
 */
Chart.preload = function () {
  return loadHighchartsBase();
};

// Preserve the existing wrapper API while keeping implementation details private.
Chart.prototype = (function () {
  /**
   * Load Highcharts, apply NCI defaults, and create the correct chart type.
   */
  var initialize = function () {
    var module = this;

    return loadHighcharts(module.settings)
      .then(function () {
        baseTheme.call(module);

        if (module.settings.chart.type in module) {
          module[module.settings.chart.type].call(module);
        } else {
          if (module.settings.chart.type == 'map') {
            // Map topology comes from chart adapters and is versioned separately
            // from the pinned Highcharts Maps scripts.
            Highcharts.setOptions({
              lang: {
                numericSymbols: ['k', 'M', 'B', 'T', 'P', 'E'],
                thousandsSep: ',',
              },
            });
            module.instance = Highcharts.mapChart(
              module.settings.target,
              module.settings
            );
          } else {
            module.instance = Highcharts.chart(
              module.settings.target,
              module.settings
            );
          }
        }
        return module.instance;
      })
      .catch(function (error) {
        console.error(
          'Could not initialize Highcharts chart "' +
            module.settings.target +
            '".',
          error
        );
        throw error;
      });
  };

  /**
   * Apply the shared NCI visual theme to Highcharts before rendering a chart.
   */
  var baseTheme = function () {
    // Shared NCI theme defaults. Chart adapters can override these in options.
    var theme = {
      colors: this.settings.colors,
      chart: {
        backgroundColor: {
          linearGradient: [0, 0, 500, 500],
          stops: [
            [0, this.settings.bgColors[0]],
            [1, this.settings.bgColors[1]],
          ],
        },
        style: {
          color: '#62559f',
        },
      },
      exporting: {
        chartOptions: {
          chart: {
            backgroundColor: '#FFF',
            spacingLeft: 60,
            spacingRight: 60,
          },
          title: {
            style: {
              fontSize: '1em',
            },
          },
          subtitle: {
            style: {
              fontSize: '0.75em',
            },
          },
          colorAxis: {
            min: 10000000,
            type: 'logarithmic',
            minColor: '#BDDDE6',
            maxColor: '#004250',
          },
        },
        sourceWidth: 600,
      },
      plotOptions: {
        pie: {
          dataLabels: {
            connectorColor: '#58595b',
          },
        },
      },
      title: {
        text: this.settings.title.text,
        style: {
          color: this.settings.title.color,
          fontFamily: this.settings.font.dinCon,
          fontSize: '32px',
          fontWeight: 'bold',
        },
      },
      subtitle: {
        text: this.settings.subtitle.text,
        style: {
          color: this.settings.subtitle.color,
          fontFamily: this.settings.font.dinCon,
          fontSize: '22px',
          fontWeight: 'normal',
        },
      },
      labels: {
        style: {
          extOutline: false,
          fontSize: '18px',
          fontFamily: this.settings.font.din,
          color: '#58595b',
        },
      },
      legend: {
        itemStyle: {
          color: '#706F6F',
          fontSize: '14px',
          fontFamily: this.settings.font.din,
          fontWeight: 'bold',
        },
      },
      credits: {
        text: 'cancer.gov',
        href: 'http://www.cancer.gov',
        style: {
          color: '#959595',
          fontFamily: this.settings.font.dinCon,
          fontSize: '13px',
          fontWeight: 'bold',
        },
        position: {
          y: -10,
        },
      },
      lang: {
        thousandsSep: ',',
      },
      tooltip: {
        backgroundColor: 'rgba(247,247,247,0.95)',
        hideDelay: 150,
        followTouchMove: false,
        style: {
          fontFamily: this.settings.font.din,
        },
        headerFormat:
          '<span style="font-size: 12px; font-weight:bold">{point.key}</span><br/>',
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> {series.name}: {point.y}<br/>',
      },
      drilldown: {
        activeAxisLabelStyle: {
          fontStyle: 'normal',
          color: '#58595b',
        },
        activeDataLabelStyle: {
          fontWeight: 'normal',
          color: '#58595b',
        },
        drillUpButton: {
          position: {
            y: 80,
          },
          relativeTo: 'spacingBox',
        },
      },
      // Axis typography defaults shared by Cartesian charts and map legends.
      colorAxis: {
        labels: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.museo,
          },
        },
      },
      xAxis: {
        labels: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.museo,
          },
        },
        title: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.din,
            textTransform: 'uppercase',
          },
        },
        lineWidth: 1,
        lineColor: '#e6e6e6',
      },
      yAxis: {
        labels: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.museo,
          },
        },
        title: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.din,
            textTransform: 'uppercase',
          },
        },
        lineWidth: 1,
        lineColor: '#e6e6e6',
      },
      zAxis: {
        labels: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.museo,
          },
        },
        title: {
          style: {
            color: '#706F6F',
            fontFamily: this.settings.font.din,
            textTransform: 'uppercase',
          },
        },
      },
      navigation: {
        buttonOptions: {
          x: 5,
        },
      },
    };

    // Apply after optional modules load so module-specific defaults are themed.
    Highcharts.setOptions(theme);
  };

  /**
   * Generate fallback color palettes for drilldown series that do not define colors.
   */
  var generateDrilldownColors = function (drilldown) {
    if (typeof drilldown.series == 'object') {
      for (
        var seriesIndex = 0;
        seriesIndex < drilldown.series.length;
        seriesIndex += 1
      ) {
        var obj = drilldown.series[seriesIndex];
        if (typeof obj.data == 'object' && typeof obj.colors == 'undefined') {
          var colors = [];
          var base = Highcharts.getOptions().colors[0];

          for (var colorIndex = 0; colorIndex < 10; colorIndex += 1) {
            // Start out with a darkened base color (negative brighten), and end
            // up with a much brighter color
            colors.push(
              Highcharts.Color(base)
                .brighten((colorIndex - 3) / 7)
                .get()
            );
          }
          obj.colors = colors;
        }
      }
    }

    return drilldown;
  };

  /**
   * Render an NCI donut/pie chart with shared legend, tooltip, and drilldown behavior.
   */
  var NCI_pie = function () {
    var module = this;

    var seriesSettings = {
      innerSize: '60%',
    };
    var drilldownSettings = {
      innerSize: '60%',
    };
    var drilldownActiveLabelSettings = {
      activeDataLabelStyle: {
        fontWeight: 'bold',
      },
    };

    var totalText;

    if (Object.keys(this.settings.drilldown).length > 0) {
      Object.assign(this.settings.drilldown, drilldownActiveLabelSettings);

      for (var i = 0; i < this.settings.drilldown.series.length; i++) {
        Object.assign(this.settings.drilldown.series[i], drilldownSettings);
      }
    }

    deepMerge(this.settings.series[0], seriesSettings);

    var presets = {
      tooltip: {
        formatter: function () {
          return (
            '<b>' +
            this.point.name +
            '</b><br/>Budget: $' +
            Highcharts.numberFormat(this.y, 0)
          );
        },
      },
      chart: {
        type: 'pie',
        events: {
          load: function (chart) {
            if (module.settings.showTotal) {
              var pie = this.series[0],
                left = this.plotLeft + pie.center[0],
                top = this.plotTop + pie.center[1] - 4;

              totalText = this.renderer.text(
                'TOTAL BUDGET<br/>$' + Highcharts.numberFormat(pie.total, 0)
              );

              totalText
                .attr({
                  'text-anchor': 'middle',
                  id: 'donutText',
                  x: left,
                  y: top,
                  style:
                    'color:#585757;font:22px/30px;font-weight:bold; ' +
                    module.settings.font.dinCon +
                    ';',
                })
                .add();
              // Offset the budget value below the TOTAL BUDGET label.
              totalText.element.children[1].setAttribute('dy', 22);
            }
          },
          redraw: function () {
            if (module.settings.showTotal) {
              var pie = this.series[0],
                left = this.plotLeft + pie.center[0],
                top = this.plotTop + pie.center[1] - 4;

              if (typeof totalText != 'undefined') {
                totalText.element.lastChild.innerHTML =
                  '$' +
                  Highcharts.numberFormat(this.series[0].data[0].total, 0);
                totalText.attr({
                  x: left,
                  y: top,
                });
              }
            }
          },
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        itemMarginBottom: 3,
      },

      series: this.settings.series,
      drilldown: generateDrilldownColors.call(this, this.settings.drilldown),

      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            distance: 15,
            crop: true,
            overflow: 'none',
            allowOverlap: true,
            y: -6,
            formatter: function (label) {
              return (
                '<span>' +
                Highcharts.numberFormat(this.percentage, 1) +
                '%</span>'
              );
            },
            style: {
              fontSize: '14px',
              fontFamily: this.settings.font.museo,
              fontWeight: 'bold',
              color: '#58595b',
            },
          },
          showInLegend: true,
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              spacingLeft: 0,
              spacingRight: 0,
              legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'vertical',
              },
            },
          },
        ],
      },
    };

    var chartSettings = deepMerge(presets, this.settings);

    // Keep the legacy NCI_pie preset rendering as a native Highcharts pie.
    chartSettings.chart.type = 'pie';

    this.instance = Highcharts.chart(this.settings.target, chartSettings);
  };

  /**
   * Render an NCI bar or column chart using the shared tooltip and column settings.
   */
  var NCI_bar = function () {
    var module = this;

    var presets = {
      chart: {
        type: 'column',
      },
      legend: {
        enabled: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      tooltip: {
        headerFormat:
          '<span style="font-size:20px; font-weight:bold">{point.key}</span><div class="flexTable--2cols">',
        pointFormat:
          '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>{point.y}</div>',
        footerFormat: '</div>',
        shared: true,
        useHTML: true,
      },
    };

    var chartSettings = deepMerge(presets, module.settings);

    // Translate legacy NCI_* preset names to native Highcharts chart types.
    chartSettings.chart.type =
      this.settings.chart.type == 'NCI_bar' ? 'bar' : 'column';

    this.instance = Highcharts.chart(this.settings.target, chartSettings);
  };

  /**
   * Render the RPG cost-per-award chart with a derived average-cost spline series.
   */
  var NCI_averageCost = function () {
    var module = this;

    /**
     * Calculate the average funding per award and return it as a spline series.
     */
    function calcSpline() {
      var spline = {
        type: 'spline',
        name: 'Average (thousands)',
        yAxis: 2,
        data: (function () {
          var data = [];
          var awardData = module.settings.series[0].data;
          var fundingData = module.settings.series[1].data;
          for (var i = 0; i < awardData.length; i++) {
            data[i] = [];
            data[i].push(Math.round(fundingData[i] / awardData[i]));
          }
          return data;
        })(),
        marker: {
          lineWidth: 2,
          lineColor: Highcharts.getOptions().colors[3],
          fillColor: 'white',
        },
        tooltip: {
          pointFormat:
            '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>${point.y:,.0f}</div>',
        },
      };

      return spline;
    }

    // Add the derived average-cost series before merging final chart settings.
    module.settings.series.push(calcSpline());

    var presets = {
      labels: {
        items: [
          {
            style: {
              left: '50px',
              top: '18px',
              color:
                (Highcharts.theme && Highcharts.theme.textColor) || 'black',
            },
          },
        ],
      },
      tooltip: {
        headerFormat:
          '<span style="font-size:10px; font-weight:bold">{point.key}</span><div class="flexTable--2cols">',
        pointFormat:
          '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>{point.y}</div>',
        footerFormat: '</div>',
        shared: true,
        useHTML: true,
      },
      series: this.settings.series,
    };

    var chartSettings = deepMerge(presets, module.settings);

    this.instance = Highcharts.chart(this.settings.target, chartSettings);
  };

  /**
   * Methods available to chart adapters and legacy preset dispatch.
   */
  return {
    init: initialize,
    NCI_pie: NCI_pie,
    NCI_bar: NCI_bar,
    NCI_column: NCI_bar,
    NCI_averageCost: NCI_averageCost,
  };
})();

export default Chart;
