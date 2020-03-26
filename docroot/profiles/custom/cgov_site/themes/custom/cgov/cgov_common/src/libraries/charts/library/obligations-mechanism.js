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
            text: 'Fiscal Year 2019'
        },
        series: [{
            name: 'Dollars in Millions',

            data: [{
                    name: 'Research Project Grants',
                    y: 2541699571,
                    drilldown: 'Research Project Grants'
                },
                {
                    name: 'Centers & SPORES',
                    y: 655966379,
                    drilldown: 'Centers & SPORES'
                },

                {
                    name: 'NRSA',
                    y: 86977607
                },
                {
                    name: 'R&D Contracts',
                    y: 768095181,
                    drilldown: 'R&D Contracts'
                },
                {
                    name: 'Intramural Research',
                    y: 964900769,
                    drilldown: 'Intramural Research'
                },
                    {
                    name: 'Buildings and Facilities',
                    y: 18000000
                },
                {
                    name: 'RMS',
                    y: 449886979,
                    drilldown: 'RMS'
                },
                    {
                    name: 'Other Research',
                    y: 3704429372,
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
                        {name: 'Non-Competing', y: 1801598220},
                        {name: 'Administrative Supplements', y: 30715356},
                        {name: 'Competing', y: 572715679}
                    ]
                },

                  {
                    name: 'Centers & SPORES',
                    id: 'Centers & SPORES',
                    colors: ['#FF5F00', '#802F00', '#FFBF99', '#FFBF99'],
                    data: [
                        {name: 'Cancer Centers Grants-P20/P30', y: 337081712},
                        {name: 'SPOREs', y: 112795999},
                        {name: 'Other P50s/P20s', y: 7423937},
                        {name: 'Other Specialized Centers', y: 198664731}
                    ]
                },

                {
                    name: 'R&D Contracts',
                    id: 'R&D Contracts',
                    colors: ['#1B5768', '#83C5D8', '#E2F0F4'],
                    data: [
                        {name: 'R&D Contracts', y: 630327168},
                        {name: 'SBIR Contracts', y: 34200374},
                        {name: 'NIH Management Fund/SSF Assessment', y: 103567638}
                    ]
                },
                {
                    name: 'Intramural Research',
                    id: 'Intramural Research',
                    colors: ['#5E1020', '#961932', '#C94C65'],
                    data: [
                        {name: 'Program', y: 740140813},
                        {name: 'NIH Management Fund/SSF Assessment', y: 224759956}
                    ]
                },
                {
                    name: 'RMS',
                    id: 'RMS',
                    colors: ['#770F3D', '#AD1658', '#F478AF'],
                    data: [
                        {name: 'Research Management and Support (RMS)', y: 340979062},
                        {name: 'SBIR RMS', y: 2999998},
                        {name: 'NIH Management Fund/SSF Assessment', y: 105907919}
                    ]
                },
                {
                    name: 'Other Research',
                    id: 'Other Research',
                    colors: ['#2A73A5','#1A4665','#3FA7F1','#319FBE','#83C5D8', '#E2F0F4', '#AAC7DB', '#70858C', '#1B5768', '#24748B'],
                    data: [
                        {name: 'Career Program', y: 506763422, drilldown: 'Career Program'},
                        {name: 'Cancer Education Program-R25 (including BD2K)', y: 20459296},
                        {name: 'Clinical Cooperative Groups-U10/UG1', y: 290137118},
                        {name: 'PreDoc PostDoc Transition Awards-F99', y: 1827785},
                        {name: 'Minority Biomedical Support-S06', y: 96830},
                        {name: 'Research Pathway in Residency-R38', y: 358020},
                        {name: 'Resource Grants-R24/U24/U2C', y: 1839210},
                        {name: 'Intl Rsrch Training Grants Conference- D43/U2R', y: 104979535},
                        {name: 'Cooperative Conference Agreements-U13', y: 814205},
                        {name: 'Conference Grants-R13', y: 1260119}
                    ]
                },
                {
                    name: 'Career Program',
                    id: 'Career Program',
                    colors: ['#2A73A5','#1A4665','#3FA7F1','#319FBE','#83C5D8', '#E2F0F4', '#AAC7DB', '#70858C', '#1B5768', '#24748B'],
                    data: [
                        {name: 'Post-Doc-Fellow Awards-K00', y: 4480191},
                        {name: 'Temin & Minority Mentored Awards-K01/K43', y: 5346036},
                        {name: 'Estab. Inv. Award-K05', y: 172247},
                        {name: 'Preventive Oncology-K07', y: 9916207},
                        {name: 'Clinical Investigator-K08', y: 30547484},
                        {name: 'Clinical Oncology-K12', y: 15653263},
                        {name: 'Transitional Career Development-K22', y: 9353712},
                        {name: 'Mentored Patient Oriented RCDA-K23', y: 1688518},
                        {name: 'Mid-Career Invest. & Patient Orient. Res-K24', y: 1512698},
                        {name: 'Mentored Quant. Res Career-K25', y: 569778},
                        {name: 'Pathway to Independence Awards-K99', y: 5517800}
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
