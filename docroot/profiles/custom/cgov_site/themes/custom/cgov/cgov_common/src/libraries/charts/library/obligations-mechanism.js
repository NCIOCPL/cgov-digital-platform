{/* <style type='text/css'>
    @media only screen and(max - width: 640 px) {
        #NCI-Chart_obligations-mechanism {
            height: 600px !important;
        }
    }
</style>
<div style="min-width: 310px; height: 450px; margin: 0 auto;" id="NCI-Chart_obligations-mechanism"></div> */}

const id = 'NCI-Chart_obligations-mechanism';

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
        colors: ['#82368C', '#FF5F00', '#44BC95', '#00B5CA', '#BB1F3F', '#FBB03B', '#ED1E79','#2A73A5'],
        title: {
            text: 'Percent Share of Total NCI Dollars'
        },
        subtitle: {
            text: 'Fiscal Year 2020'
        },
        series: [{
            name: 'Dollars in Millions',

            data: [{
                    name: 'Research Project Grants',
                    y: 2749367903,
                    drilldown: 'Research Project Grants'
                },
                {
                    name: 'Centers & SPORES',
                    y: 613771451,
                    drilldown: 'Centers & SPORES'
                },

                {
                    name: 'NRSA',
                    y: 96424956
                },
                {
                    name: 'R&D Contracts',
                    y: 823012066,
                    drilldown: 'R&D Contracts'
                },
                {
                    name: 'Intramural Research',
                    y: 1072602400,
                    drilldown: 'Intramural Research'
                },
                    {
                    name: 'Buildings and Facilities',
                    y: 30000000
                },
                {
                    name: 'RMS',
                    y: 450036450,
                    drilldown: 'RMS'
                },
                    {
                    name: 'Other Research',
                    y: 548133685,
                    drilldown: 'Other Research'
                }
            ]
        }],
        drilldown: {
            series: [
                  {
                    name: 'Research Project Grants',
                    id: 'Research Project Grants',
                    colors: ['#602968', '#995FA2', '#D0B9D7', '#DCD5E1'],
                    data: [
                        {name: 'Non-Competing', y: 1905787328},
                        {name: 'Administrative Supplements', y: 30211732},
                        {name: 'Competing', y: 662228214},
                        {name: 'SBIT/STTR Grants', y: 151140629}
                    ]
                },

                  {
                    name: 'Centers & SPORES',
                    id: 'Centers & SPORES',
                    colors: ['#FF5F00', '#802F00', '#FFBF99', '#FFBF99'],
                    data: [
                        {name: 'Cancer Centers Grants-P20/P30', y: 381955514},
                        {name: 'SPOREs', y: 113177200},
                        {name: 'Other P50s/P20s', y: 7942623},
                        {name: 'Other Specialized Centers', y: 110696114}
                    ]
                },

                {
                    name: 'R&D Contracts',
                    id: 'R&D Contracts',
                    colors: ['#1B5768', '#83C5D8', '#E2F0F4'],
                    data: [
                        {name: 'R&D Contracts', y: 684898306},
                        {name: 'SBIR Contracts', y: 23955859},
                        {name: 'NIH Management Fund/SSF Assessment', y: 114157901}
                    ]
                },
                {
                    name: 'Intramural Research',
                    id: 'Intramural Research',
                    colors: ['#5E1020', '#961932', '#C94C65'],
                    data: [
                        {name: 'Program', y: 823065394},
                        {name: 'NIH Management Fund/SSF Assessment', y: 249537006}
                    ]
                },
                {
                    name: 'RMS',
                    id: 'RMS',
                    colors: ['#770F3D', '#AD1658', '#F478AF'],
                    data: [
                        {name: 'Research Management and Support (RMS)', y: 342523328},
                        {name: 'SBIR RMS', y: 2892985},
                        {name: 'NIH Management Fund/SSF Assessment', y: 104620137}
                    ]
                },
                {
                    name: 'Other Research',
                    id: 'Other Research',
                    colors: ['#2A73A5','#1A4665','#3FA7F1','#319FBE','#83C5D8', '#E2F0F4', '#AAC7DB', '#70858C', '#24748B', '#1B5768'],
                    data: [
                        {name: 'Career Program', y: 96578305, drilldown: 'Career Program'},
                        {name: 'Cancer Education Program-R25 (including BD2K)', y: 14877672},
                        {name: 'Clinical Cooperative Groups-U10/UG1', y: 295621973},
                        {name: 'PreDoc PostDoc Transition Awards-F99', y: 1959966},
                        {name: 'Minority Biomedical Support-S06', y: 97866},
                        {name: 'Research Pathway in Residency-R38', y: 713828},
                        {name: 'Resource Grants-R24/U24/U2C', y: 134541158},
                        {name: 'Intl Rsrch Training Grants Conference- D43/U2R', y: 1003655},
                        {name: 'Cooperative Conference Agreements-U13/R13', y: 663753}
                    ]
                },
                {
                    name: 'Career Program',
                    id: 'Career Program',
                    colors: ['#2A73A5','#1A4665','#3FA7F1','#319FBE','#83C5D8', '#E2F0F4', '#AAC7DB', '#70858C', '#1B5768', '#24748B', '#5AB2CB'],
                    data: [
                        {name: 'Post-Doc-Fellow Awards-K00', y: 6019542},
                        {name: 'Temin & Minority Mentored Awards-K01/K43', y: 5450807},
                        {name: 'Estab. Inv. Award-K05', y: 0},
                        {name: 'Preventive Oncology-K07', y: 7296818},
                        {name: 'Clinical Investigator-K08', y: 41376183},
                        {name: 'Clinical Oncology-K12', y: 15968136},
                        {name: 'Transitional Career Development-K22', y: 9340487},
                        {name: 'Mentored Patient Oriented RCDA-K23', y: 1179584},
                        {name: 'Mid-Career Invest. & Patient Orient. Res-K24', y: 822239},
                        {name: 'Mentored Quant. Res Career-K25', y: 425733},
                        {name: 'Mentored Career Devel/Tem Intl Career-K43', y: 290482},
                        {name: 'Pathway to Independence Awards-K99', y: 8408294}
                    ]
                }
            ]
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 595
                },
                chartOptions: {
                    chart: {
                        height: 600
                    },
                    legend: {
                        layout: 'horizontal',
                        itemWidth: 150
                    }
                }
            }, {
                condition: {
                    minWidth: 596
                },
                chartOptions: {
                    chart: {
                        height: 450
                    }
                }
            }]
        }
    });
};


export default {
  id,
  initChart,
}
