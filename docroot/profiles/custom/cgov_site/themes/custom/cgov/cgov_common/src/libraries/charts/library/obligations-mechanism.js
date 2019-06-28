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
            text: 'Fiscal Year 2018'
        },
        series: [{
            name: 'Dollars in Millions',

            data: [{
                    name: 'Research Project Grants',
                    y: 2450557744,
                    drilldown: 'Research Project Grants'
                },
                {
                    name: 'Centers & SPORES',
                    y: 625575487,
                    drilldown: 'Centers & SPORES'
                },

                {
                    name: 'NRSA',
                    y: 82413198
                },
                {
                    name: 'R&D Contracts',
                    y: 825406010,
                    drilldown: 'R&D Contracts'
                },
                {
                    name: 'Intramural Research',
                    y: 945495709,
                    drilldown: 'Intramural Research'
                },
                    {
                    name: 'Buildings and Facilities',
                    y: 18000000
                },
                {
                    name: 'RMS',
                    y: 442415222,
                    drilldown: 'RMS'
                },
                    {
                    name: 'Other Research',
                    y: 537865734,
                    drilldown: 'Other Research'
                }
            ]
        }],
        drilldown: {
            series: [
                  {
                    name: 'Research Project Grants',
                    id: 'Research Project Grants',
                    colors: ['#602968', '#995FA2', '#D0B9D7'],
                    data: [
                        {name: 'Non-Competing', y: 1699682348},
                        {name: 'Administrative Supplements', y: 36754377},
                        {name: 'Competing', y: 571221786}
                    ]
                },

                  {
                    name: 'Centers & SPORES',
                    id: 'Centers & SPORES',
                    colors: ['#FF5F00', '#802F00', '#FFBF99', '#FFBF99'],
                    data: [
                        {name: 'Cancer Centers Grants-P20/P30', y: 331429940},
                        {name: 'SPOREs', y: 115829834},
                        {name: 'Other P50s/P20s', y: 0},
                        {name: 'Other Specialized Centers', y: 178315713}
                    ]
                },

                {
                    name: 'R&D Contracts',
                    id: 'R&D Contracts',
                    colors: ['#1B5768', '#83C5D8', '#E2F0F4'],
                    data: [
                        {name: 'R&D Contracts', y: 752280455},
                        {name: 'SBIR Contracts', y: 24363728},
                        {name: 'NIH Management Fund/SSF Assessment', y: 48761825}
                    ]
                },
                {
                    name: 'Intramural Research',
                    id: 'Intramural Research',
                    colors: ['#5E1020', '#961932', '#C94C65'],
                    data: [
                        {name: 'Program', y: 739537950},
                        {name: 'NIH Management Fund/SSF Assessment', y: 205957757}
                    ]
                },
                {
                    name: 'RMS',
                    id: 'RMS',
                    colors: ['#770F3D', '#AD1658', '#F478AF'],
                    data: [
                        {name: 'Research Management and Support (RMS)', y: 340686108},
                        {name: 'SBIR RMS', y: 0},
                        {name: 'NIH Management Fund/SSF Assessment', y: 101729113}
                    ]
                },
                {
                    name: 'Other Research',
                    id: 'Other Research',
                    colors: ['#2A73A5','#1A4665','#3FA7F1','#319FBE','#83C5D8', '#E2F0F4', '#AAC7DB', '#70858C', '#1B5768', '#24748B'],
                    data: [
                        {name: 'Career Program', y: 78337516, drilldown: 'Career Program'},
                        {name: 'Cancer Education Program-R25 (including BD2K)', y: 21181892},
                        {name: 'Clinical Cooperative Groups-U10/UG1', y: 255340505},
                        {name: 'PreDoc PostDoc Transition Awards-F99', y: 1769662},
                        {name: 'Minority Biomedical Support-S06', y: 97802},
                        {name: 'Research Pathway in Residency-R38', y: 358020},
                        {name: 'Resource Grants-R24/U24/U2C', y: 179028691},
                        {name: 'Intl Rsrch Training Grants Conference- D43/U2R', y: 943987},
                        {name: 'Cooperative Conference Agreements-U13', y: 9000},
                        {name: 'Conference Grants-R13', y: 798659}
                    ]
                },
                {
                    name: 'Career Program',
                    id: 'Career Program',
                    colors: ['#2A73A5','#1A4665','#3FA7F1','#319FBE','#83C5D8', '#E2F0F4', '#AAC7DB', '#70858C', '#1B5768', '#24748B'],
                    data: [
                        {name: 'Post-Doc-Fellow Awards-K00', y: 2293876},
                        {name: 'Temin & Minority Mentored Awards-K01/K43', y: 5979795},
                        {name: 'Estab. Inv. Award-K05', y: 444131},
                        {name: 'Preventive Oncology-K07', y: 11271537},
                        {name: 'Clinical Investigator-K08', y: 20858368},
                        {name: 'Clinical Oncology-K12', y: 14228491},
                        {name: 'Transitional Career Development-K22', y: 10304211},
                        {name: 'Mentored Patient Oriented RCDA-K23', y: 2165733},
                        {name: 'Mid-Career Invest. & Patient Orient. Res-K24', y: 2379742},
                        {name: 'Mentored Quant. Res Career-K25', y: 847484},
                        {name: 'Pathway to Independence Awards-K99', y: 7564148}
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
