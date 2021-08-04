{/* <style type='text/css'>
  @media only screen and (max-width: 640px) {#container2{height:600px !important}}
  .ui-dialog {max-width: 93vw}
  .ui-dialog .ui-dialog-content {padding:0;overflow:hidden; max-width: 100%}
  .highcharts-container hr {margin:0}
  .highcharts-data-label,.highcharts-point {cursor: pointer}
  .no-results-message {margin: 1.25em}

  @media only print {
    .highcharts-map-navigation,.highcharts-contextbutton {display:none}
    .highcharts-legend-item text {font-weight: normal !important}
  }
  </style>
  <div style="min-width: 310px; height: 450px; margin: 0 auto;" id="NCI-Chart__grants-contracts"></div> */}
import $ from 'jQuery';

const id = 'NCI-Chart__grants-contracts';

var mapData = [{
  "code": "ak",
  "state": "Alaska",
  "grants": {
    "number": 1,
    "amount": 500651
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "al",
  "state": "Alabama",
  "grants": {
    "number": 68,
    "amount": 44667925
  },
  "contracts": {
    "number": 3,
    "amount": 430000
  },
  "institutions": [{
    "name": "University of Alabama at Birmingham",
    "y": 34221926,
    "drilldown": "AL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'AL_1',
      "data": [
        ["grants", 34201926],
          ["contracts", 20000]
      ]
    }
  }]
},
{
  "code": "ar",
  "state": "Arkansas",
  "grants": {
    "number": 18,
    "amount": 6821319
  },
  "contracts": {
    "number": 1,
    "amount": 383213
  }
},
{
  "code": "az",
  "state": "Arizona",
  "grants": {
    "number": 56,
    "amount": 36386966
  },
  "contracts": {
    "number": 2,
    "amount": 872543
  },
  "institutions": [{
    "name": "University of Arizona",
    "y": 20348634,
    "drilldown": "AZ_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'AZ_1',
      "data": [
        ["grants", 19499250],
        ["contracts", 849384]
       ]
    }
  }]
},
{
  "code": "ca",
  "state": "California",
  "grants": {
    "number": 901,
    "amount": 511810003
  },
  "contracts": {
    "number": 21,
    "amount": 23208033
  },
  "institutions": [{
    "name": "City of Hope's Beckman Research Institute",
    "y": 50570709,
    "drilldown": "CA_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_1",
      "data": [
        ["grants", 50570709]
      ]
    }
  }, {
    "name": "Stanford University",
    "y": 58752474,
    "drilldown": "CA_2",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_2",
      "data": [
        ["grants", 58707637],
        ["contracts", 44837]
      ]
    }
  }, {
    "name": "University of  California San Francisco",
    "y": 93702875,
    "drilldown": "CA_3",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_3",
      "data": [
        ["grants", 89195194],
        ["contracts", 4507681]
      ]
    }
  }, {
    "name": "University of California Davis",
    "y": 23861811,
    "drilldown": "CA_4",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_4",
      "data": [
        ["grants", 23861811]
      ]
    }
  }, {
    "name": "University of California Los Angeles",
    "y": 49096603,
    "drilldown": "CA_5",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_5",
      "data": [
        ["grants", 49096603]
      ]
    }
  }, {
    "name": "University of California San Diego",
    "y": 45885119,
    "drilldown": "CA_6",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_6",
      "data": [
        ["grants", 45885119]
      ]
    }
  },
    {
     "name": "University of Southern California",
    "y": 33165612,
    "drilldown": "CA_7",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_7",
      "data": [
        ["grants", 29242720],
        ["contracts", 3922892]
      ]
    }
  },
                   {
     "name": "University of California-Irvine",
    "y": 16134223,
    "drilldown": "CA_8",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_7",
      "data": [
        ["grants", 16134223]      ]
    }
  },
                   {
     "name": "Cedars-Sinai Medical Center",
    "y": 17019819,
    "drilldown": "CA_9",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_7",
      "data": [
        ["grants", 17019819]      ]
    }
  },
    {
    "name": "Kaiser Foundation Research Institute",
    "y": 24123867,
    "drilldown": "CA_10",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_8",
      "data": [
        ["grants", 24123867]
      ]
    }
  }]
},
{
  "code": "co",
  "state": "Colorado",
  "grants": {
    "number": 98,
    "amount": 39883556
  },
  "contracts": {
    "number": 4,
    "amount": 871715
  },
  "institutions": [{
    "name": "University of Colorado Health Sciences Center",
    "y": 29329383,
    "drilldown": "CO_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CO_1",
      "data": [
        ["grants", 29329383]
        ]
    }
  }]
},
{
  "code": "ct",
  "state": "Connecticut",
  "grants": {
    "number": 121,
    "amount": 62430224
  },
  "contracts": {
    "number": 2,
    "amount": 3566890
  },
  "institutions": [{
    "name": "Yale University",
    "y": 55708809,
    "drilldown": "CT_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CT_1",
      "data": [
        ["grants", 55708809]
      ]
    }
  }]
},
{
  "code": "dc",
  "state": "District Of Columbia",
  "grants": {
    "number": 65,
    "amount": 31809829
  },
  "contracts": {
    "number": 6,
    "amount":5782749
  }
},
{
  "code": "de",
  "state": "Delaware",
  "grants": {
    "number": 11,
    "amount": 8507549
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "fl",
  "state": "Florida",
  "grants": {
    "number": 195,
    "amount": 88681302
  },
  "contracts": {
    "number": 3,
    "amount": 1868461
  },
  "institutions": [{
    "name": "H. Lee Moffitt Cancer Center & Research Institute",
    "y": 33059471,
    "drilldown": "FL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'FL_1',
      "data": [
        ["grants", 33059471]
      ]
    }
  }],
      "name": "University of Miami School of Medicine",
    "y": 15411028,
    "drilldown": "FL_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'FL_2',
      "data": [
        ["grants", 15411028]
      ]
    }
},
{
  "code": "ga",
  "state": "Georgia",
  "grants": {
    "number": 124,
    "amount": 52897830
  },
  "contracts": {
    "number": 27,
    "amount": 7133412
  },
  "institutions": [{
    "name": "Emory University",
    "y": 34831304,
    "drilldown": "GA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'GA_1',
      "data": [
        ["grants", 31873225],
        ["contracts",  2958079]
        ]
    }
  }]
},
{
  "code": "hi",
  "state": "Hawaii",
  "grants": {
    "number": 17,
    "amount": 13119588
  },
  "contracts": {
    "number": 1,
    "amount": 1685405
  }
},
{
  "code": "ia",
  "state": "Iowa",
  "grants": {
    "number": 34,
    "amount": 22992899
  },
  "contracts": {
    "number": 1,
    "amount": 4181294
  },
  "institutions": [{
    "name": "University of Iowa",
    "y": 22290410,
    "drilldown": "IA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IA_1',
      "data": [
        ["grants", 17693634],
        ["contracts", 4596776]
      ]
    }
  }]
},
{
  "code": "id",
  "state": "Idaho",
  "grants": {
    "number": 1,
    "amount": 86791
  },
  "contracts": {
    "number": 1,
    "amount": 511597
  }
},
{
  "code": "il",
  "state": "Illinois",
  "grants": {
    "number": 248,
    "amount": 131086577
  },
  "contracts": {
    "number": 9,
    "amount": 7335284
  },
  "institutions": [{
    "name": "Northwestern University at Chicago",
    "y": 48087421,
    "drilldown": "IL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IL_1',
      "data": [
        ["grants", 46368825],
        ["contracts",1718596]
      ]
    }
  }, {
    "name": "University of Chicago",
    "y": 38166194,
    "drilldown": "IL_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'IL_2',
      "data": [
        ["grants", 38166194]
       ]
    }
  }]
},
{
  "code": "in",
  "state": "Indiana",
  "grants": {
    "number": 75,
    "amount": 32834751
  },
  "contracts": {
    "number": 1,
    "amount": 121856
  },
  "institutions": [{
    "name": "Indiana University - Purdue Univ at Indianapolis",
    "y": 18904347,
    "drilldown": "IN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IN_1',
      "data": [
        ["grants", 18782491],
          ["contracts",121856]
       ]
    }
  }]
},
               {
  "code": "ia",
  "state": "Iowa",
  "grants": {
    "number": 34,
    "amount": 22992899
  },
  "contracts": {
    "number": 1,
    "amount": 4181294,
  "institutions": [{
    "name": "University of Iowa",
    "y": 21565965,
    "drilldown": "IA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IA_1',
      "data": [
        ["grants", 17384671],
          ["contracts",4181294]
       ]
    }
  }]
}},
{
  "code": "ks",
  "state": "Kansas",
  "grants": {
    "number": 22,
    "amount": 11847138
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "ky",
  "state": "Kentucky",
  "grants": {
    "number": 48,
    "amount": 20646373
  },
  "contracts": {
    "number": 2,
    "amount": 3326062
},
    "institutions": [{
    "name": "University of Kentucky",
    "y": 20004828,
    "drilldown": "KY_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'KY_1',
      "data": [
        ["grants", 17078766]
          ["contracts",2926062]
        ]
    }
  }]
},
{
  "code": "la",
  "state": "Louisiana",
  "grants": {
    "number": 31,
    "amount": 12351448
  },
  "contracts": {
    "number": 3,
    "amount": 1963048
  }
},
{
  "code": "ma",
  "state": "Massachusetts",
  "grants": {
    "number": 713,
    "amount": 413019240
  },
  "contracts": {
    "number": 7,
    "amount": 2288808
  },
  "institutions": [{
    "name": "Beth Israel Deaconess Medical Center",
    "y": 20651984,
    "drilldown": "MA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_1',
      "data": [
        ["grants", 20651984]
      ]
    }
  }, {
    "name": "Brigham and Women's Hospital",
    "y": 47129326,
    "drilldown": "MA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_2',
      "data": [
        ["grants", 47129326]
      ]
    }
  }, {
    "name": "Dana-Farber Cancer Institute",
    "y": 135834647,
    "drilldown": "MA_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_3',
      "data": [
        ["grants", 135834647]
      ]
    }
  }, {
    "name": "Harvard University",
    "y": 18228785,
    "drilldown": "MA_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_4',
      "data": [
        ["grants", 18228785]
      ]
    }
  }, {
    "name": "Massachusetts General Hospital",
    "y": 64559376,
    "drilldown": "MA_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_5',
      "data": [
        ["grants", 64559376]
      ]
    }
  },{
    "name": "Massachusetts Institute of Technology",
    "y": 21496540,
    "drilldown": "MA_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_6',
      "data": [
        ["grants", 21496540]
      ]
    }
  },{
    "name": "Broad Institute",
    "y": 15954184,
    "drilldown": "MA_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_7',
      "data": [
        ["grants", 15145134]
          ["contracts", 809050]
      ]
    }
  }]
},
{
  "code": "md",
  "state": "Maryland",
  "grants": {
    "number": 183,
    "amount": 108767277
  },
  "contracts": {
    "number": 56,
    "amount": 640578174
  },
  "institutions": [{
    "name": "The Johns Hopkins University",
    "y": 89696486,
    "drilldown": "MD_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MD_1',
      "data": [
        ["grants", 84127543],
        ["contracts", 5568943]
         ]
    }
  }]
},
{
  "code": "me",
  "state": "Maine",
  "grants": {
    "number": 15,
    "amount": 10684289
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "mi",
  "state": "Michigan",
  "grants": {
    "number": 218,
    "amount": 110188206
  },
  "contracts": {
    "number": 0,
    "amount": 93805
  },
  "institutions": [{
    "name": "University of Michigan at Ann Arbor",
    "y": 73971435,
    "drilldown": "MI_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MI_1',
      "data": [
        ["grants", 73971435]
       ]
    }
  }]
},
{
  "code": "mn",
  "state": "Minnesota",
  "grants": {
    "number": 150,
    "amount": 97085861
  },
  "contracts": {
    "number": 5,
    "amount": 1100615
  },
  "institutions": [{
    "name": "Mayo Clinic in Rochester",
    "y": 49057530,
    "drilldown": "MN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MN_1',
      "data": [
        ["grants", 48168716],
        ["contracts", 888814]
      ]
    }
  }, {
    "name": "University of Minnesota",
    "y": 38174887,
    "drilldown": "MN_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'MN_2',
      "data": [
        ["grants", 37963086]
                  ["contracts", 211801]

      ]
    }
  }]
},
{
  "code": "mo",
  "state": "Missouri",
  "grants": {
    "number": 139,
    "amount": 73424239
  },
  "contracts": {
    "number": 91,
    "amount": 12012411
  },
  "institutions": [{
    "name": "Washington University",
    "y": 65665048,
    "drilldown": "MO_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MO_1',
      "data": [
        ["grants", 65665048]
       ]
    }
  }]
},
{
  "code": "ms",
  "state": "Mississippi",
  "grants": {
    "number": 1,
    "amount": 174129
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "mt",
  "state": "Montana",
  "grants": {
    "number": 4,
    "amount": 2142882
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "nc",
  "state": "North Carolina",
  "grants": {
    "number": 283,
    "amount": 143871852
  },
  "contracts": {
    "number": 3,
    "amount": 881032
  },
  "institutions": [{
    "name": "Duke University",
    "y": 45573239,
    "drilldown": "NC_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_1',
      "data": [
        ["grants", 45573239]
      ]
    }
  }, {
    "name": "University of North Carolina at Chapel Hill",
    "y": 63832330,
    "drilldown": "NC_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_2',
      "data": [
        ["grants", 63241660]
                  ["contracts", 590670]

      ]
    }
  }, {
    "name": "Wake Forest University Health Sciences",
    "y": 22848651,
    "drilldown": "NC_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_3',
      "data": [
        ["grants", 22753651],
        ["contracts", 95000]
       ]
    }
  }]
},
{
  "code": "nd",
  "state": "North Dakota",
  "grants": {
    "number": 2,
    "amount": 437031
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "ne",
  "state": "Nebraska",
  "grants": {
    "number": 43,
    "amount": 19206733
  },
  "contracts": {
    "number": 15,
    "amount": 731379
  },
  "institutions": [{
    "name": "University of Nebraska Medical Center",
    "y": 16773988,
    "drilldown": "NE_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NE_1',
      "data": [
        ["grants", 16773988]
        ]
    }
  }]
},
{
  "code": "nh",
  "state": "New Hampshire",
  "grants": {
    "number": 37,
    "amount": 20921702
  },
  "contracts": {
    "number": 1,
    "amount": 400000
  },
               "institutions": [{
    "name": "Dartmouth College",
    "y": 14769813,
    "drilldown": "NH_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NH_1',
      "data": [
        ["grants", 14769813]
        ]
    }
  }]
},
{
  "code": "nj",
  "state": "New Jersey",
  "grants": {
    "number": 68,
    "amount": 31877988
  },
  "contracts": {
    "number": 1,
    "amount": 6129864
  },
     "institutions": [{
    "name": "RBHS - Cancer Institute of New Jersey",
    "y": 15902672,
    "drilldown": "NJ_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NJ_1',
      "data": [
        ["grants", 15902672]
        ]
    }
  }]
},

{
  "code": "nm",
  "state": "New Mexico",
  "grants": {
    "number": 26,
    "amount": 15629275
  },
  "contracts": {
    "number": 1,
    "amount": 2597703
  }
},
{
  "code": "nv",
  "state": "Nevada",
  "grants": {
    "number": 3,
    "amount": 2237299
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "ny",
  "state": "New York",
  "grants": {
    "number": 807,
    "amount": 454380486
  },
  "contracts": {
    "number": 8,
    "amount": 11170884
  },
  "institutions": [{
    "name": "Albert Einstein College of Medicine",
    "y": 20468044,
    "drilldown": "NY_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_1',
      "data": [
        ["grants", 20468044]
      ]
    }
  }, {
    "name": "Columbia University Health Sciences",
    "y": 50706130,
    "drilldown": "NY_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_2',
      "data": [
        ["grants", 50464140]
        ["contracts", 241990]

      ]
    }
  }, {
    "name": "Icahn School of Medicine at Mount Sinai",
    "y": 39315843,
    "drilldown": "NY_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_3',
      "data": [
        ["grants", 39305843]
                  ["contracts", 10000]

      ]
    }
  }, {
    "name": "New York University School of Medicine",
    "y": 44310374,
    "drilldown": "NY_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_4',
      "data": [
        ["grants", 44310374]
      ]
    }
  }, {
    "name": "Roswell Park Cancer Institute Corporation",
    "y": 26880306,
    "drilldown": "NY_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_5',
      "data": [
        ["grants", 26880306]
      ]
    }
  }, {
    "name": "Sloan-Kettering Institute for Cancer Research",
    "y": 123334719,
    "drilldown": "NY_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_6',
      "data": [
        ["grants", 123334719]
      ]
    }
  },
                   {
    "name": "Montefiore Medical Center - Bronx, NY",
    "y": 24709760,
    "drilldown": "NY_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_7',
      "data": [
        ["grants", 24709760]
      ]
    }
  },
                   {
    "name": "University of Rochester",
    "y": 16542905,
    "drilldown": "NY_8",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_8',
      "data": [
        ["grants", 16542905]
      ]
    }
  },{
    "name": "Weill Medical Coll of Cornell Univ",
    "y": 36756046,
    "drilldown": "NY_9",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_9',
      "data": [
        ["grants", 36756046],
      ]
    }
  }]
},
{
  "code": "oh",
  "state": "Ohio",
  "grants": {
    "number": 244,
    "amount": 126836694
  },
  "contracts": {
    "number": 1,
    "amount": 364920
  },
  "institutions": [{
    "name": "Case Western Reserve University",
    "y": 35713302,
    "drilldown": "OH_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_1',
      "data": [
        ["grants", 35713302]
      ]
    }
  },
                   {
    "name": "Ohio State University",
    "y": 48240882,
    "drilldown": "OH_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_2',
      "data": [
        ["grants", 14242589],
        ["contracts", 3714777]
      ]
    }
  },
{
  "code": "ok",
  "state": "Oklahoma",
  "grants": {
    "number": 34,
    "amount": 16216510
  },
  "contracts": {
    "number": 2,
    "amount": 4112926
  }
},
                   {
    "name": "University of Oklahoma Health Sciences",
    "y": 17957366,
    "drilldown": "OK_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OK_1',
      "data": [
        ["grants", 14242589],
        ["contracts", 3714777]
      ]
    }
  },
{
  "code": "or",
  "state": "Oregon",
  "grants": {
    "number": 59,
    "amount": 46932108
  },
  "contracts": {
    "number": 33,
    "amount": 1709982
  },
  "institutions": [{
    "name": "Oregon Health and Science University",
    "y": 42201651,
    "drilldown": "OR_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OR_1',
      "data": [
        ["grants", 42191651]
        ["contracts", 10000]

      ]
    }
  }]
},
{
  "code": "pa",
  "state": "Pennsylvania",
  "grants": {
    "number": 474,
    "amount": 321815334
  },
  "contracts": {
    "number": 31,
    "amount": 2499775
  },
  "institutions": [{
    "name": "Children's Hosp of Philadelphia",
    "y": 57098331,
    "drilldown": "PA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_1',
      "data": [
        ["grants", 57098331]
      ]
    }
  }, {
    "name": "ECOG-ACRIN Medical Research Foundation",
    "y": 30096745,
    "drilldown": "PA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_2',
      "data": [
        ["grants", 30096745]
      ]
    }
  }, {
    "name": "NRG Oncology Foundation, INC",
    "y": 31167125,
    "drilldown": "PA_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_3',
      "data": [
        ["grants", 31167125]
      ]
    }
  },
                   {
    "name": "University of Pennsylvania",
    "y": 68897817,
    "drilldown": "PA_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_4',
      "data": [
        ["grants", 68897817]
      ]
    }
  }, {
    "name": "University of Pittsburgh",
    "y": 46833399,
    "drilldown": "PA_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_5',
      "data": [
        ["grants", 46770717],
        ["contracts", 62682]
      ]
    }
  }, {
    "name": "Wistar Institute",
    "y": 19546701,
    "drilldown": "PA_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_6',
      "data": [
        ["grants", 19546701]
     ]
    }
  }]
},
                   {
    "name": "Thomas Jefferson University",
    "y": 19376594,
    "drilldown": "PA_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_7',
      "data": [
        ["grants", 19376594]
     ]
    }
  }]
},
{
  "code": "ri",
  "state": "Rhode Island",
  "grants": {
    "number": 15,
    "amount": 3497796
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "sc",
  "state": "South Carolina",
  "grants": {
    "number": 63,
    "amount": 32935920
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "Medical University of South Carolina",
    "y": 22882816,
    "drilldown": "SC_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'SC_1',
      "data": [
        ["grants", 22882816]
       ]
    }
  }]
},
{
  "code": "sd",
  "state": "South Dakota",
  "grants": {
    "number": 3,
    "amount": 1039369
  },
  "contracts": {
    "number": 2,
    "amount": 3986764
  }
},
{
  "code": "tn",
  "state": "Tennessee",
  "grants": {
    "number": 166,
    "amount": 111564944
  },
  "contracts": {
    "number": 6,
    "amount": 5878460
  },
  "institutions": [{
    "name": "St. Jude Children's Research Hospital",
    "y": 42150658,
    "drilldown": "TN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_1',
      "data": [
        ["grants", 42150658]
      ]
    }
  }, {
    "name": "Vanderbilt University Medical Center",
    "y": 44301236,
    "drilldown": "TN_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_2',
      "data": [
        ["grants", 44301236]
      ]
    }
  }, {
    "name": "Vanderbilt University",
    "y": 15723574,
    "drilldown": "TN_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_3',
      "data": [
        ["grants", 15723574]
      ]
    }
  }]
},
{
  "code": "tx",
  "state": "Texas",
  "grants": {
    "number": 523,
    "amount": 272089090
  },
  "contracts": {
    "number": 5,
    "amount": 2837385
  },
  "institutions": [{
    "name": "Baylor College of Medicine",
    "y": 44061774,
    "drilldown": "TX_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_1',
      "data": [
        ["grants", 44061774]
      ]
    }
  }, {
    "name": "University of Texas, MD Anderson Cancer Center",
    "y": 130074855,
    "drilldown": "TX_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_2',
      "data": [
        ["grants", 128062250],
          ["contracts",2012605]
      ]
    }
  },
                   {
    "name": "University of Texas Health Sciences Center",
    "y": 14796387,
    "drilldown": "TX_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_3',
      "data": [
        ["grants", 14796387],
      ]
    }
  }, {
    "name": "UT Southwestern Medical Center",
    "y": 14796387,
    "drilldown": "TX_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_4',
      "data": [
        ["grants", 14796387]
      ]
    }
  }]
},
{
  "code": "ut",
  "state": "Utah",
  "grants": {
    "number": 75,
    "amount": 32792335
  },
  "contracts": {
    "number": 3,
    "amount": 2549539
  },
  "institutions": [{
    "name": "University of Utah",
    "y": 34898834,
    "drilldown": "UT_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'UT_1',
      "data": [
        ["grants", 32497335],
        ["contracts", 2401499]
     ]
    }
  }]
},
{
  "code": "va",
  "state": "Virginia",
  "grants": {
    "number": 103,
    "amount": 53470365
  },
  "contracts": {
    "number": 16,
    "amount": 42342521
  },
  "institutions": [{
    "name": "University of Virginia",
    "y": 21096782,
    "drilldown": "VA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'VA_1',
      "data": [
        ["grants", 21096782]
     ]
    }
  }]
},
{
  "code": "vt",
  "state": "Vermont",
  "grants": {
    "number": 7,
    "amount": 4064637
  },
  "contracts": {
    "number": 1,
    "amount": 15000
  }
},
{
  "code": "wa",
  "state": "Washington",
  "grants": {
    "number": 221,
    "amount": 155240747
  },
  "contracts": {
    "number": 3,
    "amount": 5559755
  },
  "institutions": [{
    "name": "Fred Hutchinson Cancer Research Center",
    "y": 108960753,
    "drilldown": "WA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'WA_1',
      "data": [
        ["grants", 104055491],
        ["contracts", 4905262]
      ]
    }
  }, {
    "name": "University of Washington",
    "y": 24692319,
    "drilldown": "WA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'WA_2',
      "data": [
        ["grants", 24692319]
       ]
    }
  }]
},
{
  "code": "wi",
  "state": "Wisconsin",
  "grants": {
    "number": 104,
    "amount": 68709264
  },
  "contracts": {
    "number": 2,
    "amount": 1275685
  },
  "institutions": [{
    "name": "University of Wisconsin - Madison",
    "y": 39499081,
    "drilldown": "WI_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'WI_1',
      "data": [
        ["grants", 38300245],
          ["contracts",1198836]
      ]
    }
  }, {
    "name": "Medical College of Wisconsin",
    "y": 18858447,
    "drilldown": "WI_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'WI_2',
      "data": [
        ["grants", 18858447]
       ]
    }
  }]
},
{
  "code": "wv",
  "state": "West Virginia",
  "grants": {
    "number": 6,
    "amount": 2136317
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "wy",
  "state": "Wyoming",
  "grants": {
    "number": 0,
    "amount": 0
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
}
];

// store all our modal popups for manipulation later
var popups = [];

function repositionModals(e) {
  var windowWidth = window.document.body.getBoundingClientRect().width;
  popups.forEach(function (popup) {
    var popupElement = popup.get(0);
    var popupDimensions = popupElement.getBoundingClientRect();
    var overflowRight = windowWidth - popupDimensions.right;
    if(overflowRight < 0){
      popup.css({ right: 0, left: 'auto'});
    }
    else {
      popup.css({ right: '', left: Math.floor(popupDimensions.left) + 'px' });
    }
  })
}

window.addEventListener('resize', repositionModals);

function initChart(Chart) {
  $.each(mapData, function () {
    this.code = this.code.toUpperCase();
    // TODO: logarithmic values cannot be 0 or negative numbers
    this.value = this.grants.amount + this.contracts.amount || 0.00001;
  });

  var dialogOffset = 0;

  new Chart(id, {
    chart: {
      type: 'map',
      map: 'countries/us/us-all',
      borderWidth: 1
    },

    title: {
      text: 'Grant and Contract Awards by State and Institution, FY 2020'
    },

    credits: {
      mapText: '',
      mapTextFull: ''
    },

    exporting: {
      sourceWidth: 600,
      sourceHeight: 500
    },

    legend: {
      layout: 'horizontal',
      borderWidth: 0,
      backgroundColor: '#fff',
      floating: false,
      verticalAlign: 'top',
      margin: 0
    },

    mapNavigation: {
      enabled: true
    },

    colorAxis: {
      min: 10000000,
      type: 'logarithmic',
      minColor: '#E2F0F4',
      maxColor: '#00181D',
      stops: [
        [0, '#E2F0F4'],
        [0.6, '#24748B'],
        [1, '#00181D']
      ]
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 640
        },
        chartOptions: {
          mapNavigation: {
            enabled: false
          }
        }
      }]
    },
    tooltip: {
      //pointFormat_old: '{point.code}: ${point.value}',
      useHTML: true,
      formatter: function () {
        var header = '<div><div style="font-size: 13px;margin-bottom:3px">' + this.point
          .options.state +
          '</div><table style="border-collapse:collapse;margin: 0 auto">';
        var template = '<tr><td>Grants (' + this.point.grants.number +
          '): </td><td align="right"><b>$' + Highcharts.numberFormat(this.point.grants
            .amount, 0) + '</b></td></tr><tr><td>Contracts (' + this.point.contracts
          .number + '): </td><td align="right"><b>$' + Highcharts.numberFormat(this
            .point.contracts.amount, 0) +
          '</b></td></tr><tr><td style="border-top: 1px solid #000;">' + this.series
          .name +
          ':</td><td style="border-top: 1px solid #000;" align="right"><b>$' +
          Highcharts.numberFormat(this.point.value, 0) + '</b></td></tr>';
        var footer = '</table></div>';

        return header + template + footer
      }
    },

    series: [{
      animation: {
        duration: 1000
      },
      data: mapData,
      joinBy: ['postal-code', 'code'],
      dataLabels: {
        enabled: true,
        color: '#FFFFFF',
        format: '{point.code}'
      },
      name: 'Total Awarded',
      point: {
        events: {
          // mouseOver: function (event) {
          //   if (this.options.institutions) {
          //     this.graphic.element.style.cursor = 'pointer';
          //   }
          // },
          click: function () {

            // if there are institutions for this state then render a PIE chart
            if (this.options.institutions) {

              function renderPieChart(options) {
                // pie chart drill down showing institutions
                var modalChart = new Highcharts.Chart({
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
                $modal.dialog("option", {title: this.name});
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
    }]
  }); //END new Chart
}


export default {
  id,
  initChart
};
