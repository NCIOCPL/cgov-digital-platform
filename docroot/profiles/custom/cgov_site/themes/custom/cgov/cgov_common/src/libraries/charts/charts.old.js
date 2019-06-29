// I'm leaving this in the repo for at least one more rounds of refactors as a point of reference for whichever poor dev
// has to wrangle the black box of configuring a 3rd party library.

define(function(require) {
// Module Constructor - matching Highcarts' arguments of target, options
    var Chart = function (target, options) {
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
                '#1C4A79'
            ],
            bgColors: [
                '#ffffff',
                '#f0f0ff'
            ],
            font: {
                dinCon: 'DIN Condensed, Arial Narrow, Arial, sans-serif',
                din: 'DIN Regular, Arial, sans-serif',
                museo: 'Museo, Montserrat, Arial, sans-serif'
            },
            title: {
                color: '#62559f'
            },
            subtitle: {
                color: '#62559f'
            },
            drilldown: {}
        };

        // extend defaults with settings
        this.settings = $.extend(true, {}, this.defaultSettings, options);
        this.settings.target = target;

        if (typeof window.fetchingHighcharts == "undefined") {
            window.fetchingHighcharts = false;
        }

        this.init();

    };

// Module methods
    Chart.prototype = function () {
        var loadHighcharts = function () {

            var dfd = $.Deferred();

            if (typeof Highcharts == 'undefined' && !window.fetchingHighcharts) {
                console.log("loading Highcharts");
                console.time("Highcharts Load Time");
                window.fetchingHighcharts = true;
                $.when(
                    $.getScript('https://code.highcharts.com/highcharts.src.js')
                ).then(function () {
                    console.log("loading Highchart plug-ins");
                    return $.when(
                        $.getScript('https://code.highcharts.com/modules/exporting.js'),
                        $.getScript('https://code.highcharts.com/modules/offline-exporting.js'),
                        $.getScript('https://code.highcharts.com/modules/accessibility.js'),
                        $.getScript('https://code.highcharts.com/modules/drilldown.js')
                    ).done(function () {
                        console.log("Highcharts plug-ins loaded");
                        window.fetchingHighcharts = false;
                        console.timeEnd("Highcharts Load Time");
                        dfd.resolve();
                    });
                });
            } else {
                console.log("Highcharts is loading...");

                function isHighchartsLoaded () {
                    if (typeof Highcharts == "undefined" || typeof Highcharts == "object" && window.fetchingHighcharts) {
                        setTimeout(function () {
                            console.log("Highcharts is not ready yet...");
                            isHighchartsLoaded();
                        }, 100);
                    } else {
                        console.log("Highcharts and plug-ins are loaded");
                        dfd.resolve();
                    }
                }

                isHighchartsLoaded();

            }

            return dfd.promise();
        };

        var initialize = function () {

            var module = this;

            $.when(loadHighcharts.call(module)).done(function () {
                //console.log("Highcharts is present");
                baseTheme.call(module);

                if (module.settings.chart.type in module) {
                    console.log("rendering custom chart:", module.settings.chart.type);
                    module[module.settings.chart.type].call(module);
                } else {

                    if(module.settings.chart.type == 'map'){
                        console.log("rendering highmap:", module.settings.chart.type);
                        console.time("Highmaps Load Time");
                        // this is starting to look like a callback pyramid of doom
                        $.when(
                            $.getScript('https://code.highcharts.com/maps/modules/map.js'),
                            $.getScript('https://code.highcharts.com/mapdata/countries/us/us-all.js')
                        ).done(function () {
                            console.timeEnd("Highmaps Load Time");
                            Highcharts.setOptions({
                                lang: {
                                    numericSymbols: [ "k" , "M" , "B" , "T" , "P" , "E"],
                                    thousandsSep: ","
                                }
                            });
                            module.instance = Highcharts.mapChart(module.settings.target, module.settings)
                        });
                    } else {
                        console.log("rendering default chart:", module.settings.chart.type);
                        module.instance = Highcharts.chart(module.settings.target, module.settings)
                    }
                }
            });

        };

        var baseTheme = function () {
            console.log("applying base theme");
            // theme settings for NCI
            var theme = {
                lang: {
                    thousandsSep: ','
                },
                colors: this.settings.colors,
                chart: {
                    backgroundColor: {
                        linearGradient: [0, 0, 500, 500],
                        stops: [
                            [0, this.settings.bgColors[0]],
                            [1, this.settings.bgColors[1]]
                        ]
                    },
                    style: {
                        color: '#62559f'
                    }
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            connectorColor: '#58595b'
                        }
                    }
                },
                title: {
                    text: this.settings.title.text,
                    style: {
                        color: this.settings.title.color,
	                    fontFamily: this.settings.font.dinCon,
	                    fontSize: '32px',
	                    fontWeight: 'bold'
                    }
                },
                subtitle: {
                    text: this.settings.subtitle.text,
                    style: {
                        color: this.settings.subtitle.color,
	                    fontFamily: this.settings.font.dinCon,
                        fontSize: '22px',
                        fontWeight: 'normal'
                    }
                },
                labels: {
                    style: {
	                    extOutline: false,
	                    fontSize: '18px',
	                    fontFamily: this.settings.font.din,
	                    color: '#58595b'
                    }
                },
                legend: {
                    itemStyle: {
                        color: '#706F6F',
	                    fontSize: '14px',
	                    fontFamily: this.settings.font.din,
                        fontWeight: 'bold'
                    }
                },
                credits: {
                    text: 'cancer.gov',
                    href: 'http://www.cancer.gov',
                    style: {
                        color: '#959595',
                        fontFamily: this.settings.font.dinCon,
                        fontSize: '13px',
                        fontWeight: 'bold'
                    },
                    position: {
                        y: -10
                    }
                },
                lang: {
                    thousandsSep: ','
                },
                // plotOptions: {
                //     pie: {
                //         cursor: 'pointer',
                //         dataLabels: {
                //             enabled: true,
                //             distance: 15,
                //             crop: false,
                //             overflow: 'none',
                //             allowOverlap: true,
                //             y: -2,
                //             style: {
                //                 textOutline: false,
                //                 fontSize: '11px',
                //                 fontFamily: '"Noto Sans", Arial, sans-serif'
                //             }
                //         }
                //     }
                // },
                tooltip: {
                    backgroundColor: 'rgba(247,247,247,0.95)',
                    hideDelay: 150,
                    followTouchMove: false,
                    style: {
                        fontFamily: this.settings.font.din
                    },
                    headerFormat: '<span style="font-size: 12px; font-weight:bold">{point.key}</span><br/>',
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: {point.y}<br/>'
                },
                drilldown: {
                    activeAxisLabelStyle: {
                        fontStyle: 'normal',
	                    color: '#58595b'
                    },
                    activeDataLabelStyle: {
                        fontWeight: 'normal',
                        color: '#58595b'
                    },
                    drillUpButton: {
                        position: {
                            y: 80
                        },
                        relativeTo: 'spacingBox'
                    }
                },
                // making axis labels and titles gray
                xAxis: {
                    labels: {
                        style: {
                            color: '#706F6F',
                            fontFamily: this.settings.font.museo
                        }
                    },
                    title: {
                        style: {
                            color: '#706F6F',
	                        fontFamily: this.settings.font.din,
                            textTransform: 'uppercase'
                        }
                    },
                    lineWidth: 1,
                    lineColor: '#e6e6e6'
                },
                yAxis: {
                    labels: {
                        style: {
                            color: '#706F6F',
	                        fontFamily: this.settings.font.museo
                        }
                    },
                    title: {
                        style: {
                            color: '#706F6F',
	                        fontFamily: this.settings.font.din,
	                        textTransform: 'uppercase'
                        }
                    },
                    lineWidth: 1,
                    lineColor: '#e6e6e6'
                },
                zAxis: {
                    labels: {
                        style: {
                            color: '#706F6F',
	                        fontFamily: this.settings.font.museo
                        }
                    },
                    title: {
                        style: {
                            color: '#706F6F',
	                        fontFamily: this.settings.font.din,
	                        textTransform: 'uppercase'
                        }
                    }
                }
            };

            // Apply the theme
            Highcharts.setOptions(theme);
        };



        var generateDrilldownColors = function(drilldown){

            if(typeof drilldown.series == "object") {

                for (var i = 0; i < drilldown.series.length; i++) {
                    var obj = drilldown.series[i];
                    if (typeof obj.data == "object" && typeof obj.colors == "undefined") {

	                    var colors = [],
		                    base = base || Highcharts.getOptions().colors[0],
		                    i;

	                    for (i = 0; i < 10; i += 1) {
		                    // Start out with a darkened base color (negative brighten), and end
		                    // up with a much brighter color
		                    colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
	                    }
	                    obj.colors = colors;
                    }
                }
            }

            return drilldown;

        };

        var NCI_pie = function () {


            var module = this;

            var seriesSettings = {
                innerSize: '60%'
            };
            var drilldownSettings = {
                innerSize: '60%'
            };
            var moreDrilldownSettingsBecauseOfStupidFontStyles = {
                activeDataLabelStyle: {
                    fontWeight: 'bold'
                }
            }

            var totalText;

            if (Object.keys(this.settings.drilldown).length > 0) {

                $.extend(this.settings.drilldown, moreDrilldownSettingsBecauseOfStupidFontStyles);

                for (var i = 0; i < this.settings.drilldown.series.length; i++) {
                    $.extend(this.settings.drilldown.series[i], drilldownSettings);
                    //this.settings.drilldown.series[i].id = this.settings.drilldown.series[i].name;
                    //this.settings.drilldown.series[i].id = this.settings.drilldown.series[i].name;
                }
            }

            $.extend(true, this.settings.series[0], seriesSettings);

            // console.log("pie settings",this.settings);

            //this.instance = Highcharts.chart(this.settings.target, this.settings);

            var presets = {
                tooltip: {
                    // pointFormat: '{series.name}: <b>{point.y:.1f}%</b>: <b>{point.percentage:.1f}%</b>',
                    formatter: function () {
                        return '<b>' + this.point.name + '</b><br/>Budget: $' + Highcharts.numberFormat(this.y, 0);
                        // return '<b>' + this.point.name + '<br/>$' + Highcharts.numberFormat(this.y, 0) + '</b> <br />' + Highcharts.numberFormat(this.percentage, 1) +'%';
                    }
                },
                chart: {
                    type: 'pie',
                    events: {
                        // drilldown: function () {
                        //     // console.log(this);
                        //     //this.chartHeight += 70;
                        //     //this.series[0].chart.marginBottom += 70;
                        // },
                        load: function (chart) {

                            if(module.settings.showTotal) {

                                var pie = this.series[0],
                                    left = this.plotLeft + pie.center[0],
                                    top = this.plotTop + pie.center[1] - 4;

                                totalText = this.renderer.text("TOTAL BUDGET<br/>$" + Highcharts.numberFormat(pie.total, 0));

                                totalText.attr({
                                    'text-anchor': 'middle',
                                    id: 'donutText',
                                    x: left,
                                    y: top,
                                    style: 'color:#585757;font:22px/30px;font-weight:bold; ' + module.settings.font.dinCon + ';'
                                }).add();
                                // move the budget number down a bit
                                totalText.element.children[1].setAttribute('dy', 22);

                            }
                        },
                        redraw: function () {
                            if(module.settings.showTotal) {
                                var pie = this.series[0],
                                    left = this.plotLeft + pie.center[0],
                                    top = this.plotTop + pie.center[1] - 4;

                                if (typeof totalText != 'undefined') {

                                    totalText.element.lastChild.innerHTML = "$" + Highcharts.numberFormat(this.series[0].data[0].total, 0);
                                    totalText.attr({
                                        x: left,
                                        y: top
                                    })
                                }
                            }
                        }
                    }
                },

                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    itemMarginBottom: 3
                },

                series: this.settings.series,
                //drilldown: this.settings.drilldown,
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
                                return '<span>' + Highcharts.numberFormat(this.percentage, 1) + '%</span>';
                                //return '<span style="color:' + this.point.color + '">' + Highcharts.numberFormat(this.percentage, 1) + '%</span>';
                                //return '<span style="color:' + this.point.color + '">' + this.point.name + '</span>';
                            },
	                        style: {
		                        fontSize: '14px',
		                        fontFamily: this.settings.font.museo,
		                        fontWeight: 'bold',
		                        color: '#58595b'
	                        }
                        },
                        showInLegend: true
                    }
                },
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            spacingLeft: 0,
                            spacingRight: 0,
                            legend: {
                                align: 'center',
                                verticalAlign: 'bottom',
                                layout: 'vertical'
                            }
                        }
                    }
                        // ,
                        // {
                        //     condition: {
                        //         minWidth: 650
                        //     },
                        //     chartOptions: {
                        //         plotOptions: {
                        //             pie: {
                        //                 dataLabels: {
                        //                     y: -6,
                        //                     style: {
                        //                         fontSize: '16px'
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                    ]
                }
            };

            var chartSettings = $.extend(true, presets, this.settings);

            //force the chart type to pie
            chartSettings.chart.type = "pie";

            this.instance = Highcharts.chart(this.settings.target, chartSettings);

        };

        var NCI_bar = function () {

            var module = this;

            var presets = {
                chart: {
                    type: 'column'
                },
                legend: {
                    enabled: true,

                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:20px; font-weight:bold">{point.key}</span><div class="flexTable--2cols">',
                    //pointFormat: '<div style="color:{series.color};">{series.name}: </div><div>{point.y}</div>',
                    pointFormat: '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>{point.y}</div>',
                    footerFormat: '</div>',
                    shared: true,
                    useHTML: true
                }
            };

            var chartSettings = $.extend(true, presets, module.settings);

            //force the chart type to bar or column
            chartSettings.chart.type = this.settings.chart.type == 'NCI_bar' ? 'bar' : 'column';

            // console.log('chartSettings',chartSettings);

            this.instance = Highcharts.chart(this.settings.target, chartSettings);
        };

        var NCI_averageCost = function () {

            // console.log("averageCost settings:",this.settings);

            var module = this;

            // Highcharts.Axis.prototype.hasData = function () {
            //     return this.hasVisibleSeries;
            // };

            function calcSpline () {
                var spline = {
                    type: 'spline',
                    name: 'Average (thousands)',
                    yAxis: 2,
                    data: (function () {
                            var data = [];
                            var awardData = module.settings.series[0].data;
                            var fundingData = module.settings.series[1].data;
                            for (var i = 0; i < awardData.length; i++) {
                                // if (awardData.length >= i && fundingData.length >= i) {
                                data[i] = [];
                                data[i].push(Math.round(fundingData[i] / awardData[i])); //average
                                // }
                            }
                            return data;
                        }()
                    ),
                    marker: {
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[3],
                        fillColor: 'white'
                    },
                    tooltip: {
                        pointFormat: '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>${point.y:,.0f}</div>'
                    }
                };

                return spline;
            }

            // Caluculate Avergate and Generate Spline
            module.settings.series.push(calcSpline());

            var presets = {
                labels: {
                    items: [{
                        style: {
                            left: '50px',
                            top: '18px',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                        }
                    }]
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px; font-weight:bold">{point.key}</span><div class="flexTable--2cols">',
                    pointFormat: '<div><span style="color:{point.color}">\u25CF</span> {series.name}: </div><div>{point.y}</div>',
                    footerFormat: '</div>',
                    shared: true,
                    useHTML: true
                },
                series: this.settings.series
            };

            var chartSettings = $.extend(true, presets, module.settings);

            this.instance = Highcharts.chart(this.settings.target, chartSettings);
        };

        /**
         * Exposed functions of this module.
         */
        return {
            init: initialize,
            NCI_pie: NCI_pie,
            NCI_bar: NCI_bar,
            NCI_column: NCI_bar,
            NCI_averageCost: NCI_averageCost
        }

    }();

    return Chart;
});
