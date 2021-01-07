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
    "number": 0,
    "amount": 0
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
    "number": 63,
    "amount": 32036913
  },
  "contracts": {
    "number": 0,
    "amount": 666907
  },
  "institutions": [{
    "name": "University of Alabama at Birmingham",
    "y": 28109065,
    "drilldown": "AL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'AL_1',
      "data": [
        ["grants", 28109065]
      ]
    }
  }]
},
{
  "code": "ar",
  "state": "Arkansas",
  "grants": {
    "number": 14,
    "amount": 5186322
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "az",
  "state": "Arizona",
  "grants": {
    "number": 59,
    "amount": 37531259
  },
  "contracts": {
    "number": 1,
    "amount": 1267397
  },
  "institutions": [{
    "name": "University of Arizona",
    "y": 18227029,
    "drilldown": "AZ_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'AZ_1',
      "data": [
        ["grants", 16959632],
        ["contracts", 1267397]
       ]
    }
  }]
},
{
  "code": "ca",
  "state": "California",
  "grants": {
    "number": 898,
    "amount": 505460287
  },
  "contracts": {
    "number": 23,
    "amount": 22659474
  },
  "institutions": [{
    "name": "City of Hope's Beckman Research Institute",
    "y": 44449448,
    "drilldown": "CA_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_1",
      "data": [
        ["grants", 44449448]
      ]
    }
  }, {
    "name": "Stanford University",
    "y": 61616170,
    "drilldown": "CA_2",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_2",
      "data": [
        ["grants", 61570849],
        ["contracts", 45321]
      ]
    }
  }, {
    "name": "University of  California San Francisco",
    "y": 98339307,
    "drilldown": "CA_3",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_3",
      "data": [
        ["grants", 93884608],
        ["contracts", 4454699]
      ]
    }
  }, {
    "name": "University of California Davis",
    "y": 22743243,
    "drilldown": "CA_4",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_4",
      "data": [
        ["grants", 22743243]
      ]
    }
  }, {
    "name": "University of California Los Angeles",
    "y": 58216860,
    "drilldown": "CA_5",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_5",
      "data": [
        ["grants", 58216860]
      ]
    }
  }, {
    "name": "University of California San Diego",
    "y": 42060347,
    "drilldown": "CA_6",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_6",
      "data": [
        ["grants", 42060347]
      ]
    }
  },
    {
     "name": "University of Southern California",
    "y": 34403579,
    "drilldown": "CA_7",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_7",
      "data": [
        ["grants", 30064688],
        ["contracts", 4338891]
      ]
    }
  },
    {
    "name": "Kaiser Foundation Research Institute",
    "y": 19607032,
    "drilldown": "CA_8",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_8",
      "data": [
        ["grants", 19607032]
      ]
    }
  }]
},
{
  "code": "co",
  "state": "Colorado",
  "grants": {
    "number": 91,
    "amount": 34792933
  },
  "contracts": {
    "number": 2,
    "amount": 2299989
  },
  "institutions": [{
    "name": "University of Colorado Health Sciences Center",
    "y": 26953288,
    "drilldown": "CO_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CO_1",
      "data": [
        ["grants", 26953288]
        ]
    }
  }]
},
{
  "code": "ct",
  "state": "Connecticut",
  "grants": {
    "number": 106,
    "amount": 52640196
  },
  "contracts": {
    "number": 4,
    "amount": 5863644
  },
  "institutions": [{
    "name": "Yale University",
    "y": 48752733,
    "drilldown": "CT_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CT_1",
      "data": [
        ["grants", 48752733]
      ]
    }
  }]
},
{
  "code": "dc",
  "state": "District Of Columbia",
  "grants": {
    "number": 65,
    "amount": 30717894
  },
  "contracts": {
    "number": 19,
    "amount": 20330493
  },
  "institutions": [{
    "name": "Georgetown University",
    "y": 16066986,
    "drilldown": "DC_1",
    "drilldown_data": {
      "name": "Total",
      "id": "DC_1",
      "data": [
        ["grants", 16066986]
      ]
    }
  }]
},
{
  "code": "de",
  "state": "Delaware",
  "grants": {
    "number": 10,
    "amount": 7293873
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
    "number": 189,
    "amount": 84043318
  },
  "contracts": {
    "number": 3,
    "amount": 1186589
  },
  "institutions": [{
    "name": "H. Lee Moffitt Cancer Center & Research Institute",
    "y": 31653152,
    "drilldown": "FL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'FL_1',
      "data": [
        ["grants", 31653152]
      ]
    }
  }]
},
{
  "code": "ga",
  "state": "Georgia",
  "grants": {
    "number": 109,
    "amount": 46660508
  },
  "contracts": {
    "number": 33,
    "amount": 5929210
  },
  "institutions": [{
    "name": "Emory University",
    "y": 32920747,
    "drilldown": "GA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'GA_1',
      "data": [
        ["grants", 30016707],
        ["contracts",  2904040]
        ]
    }
  }]
},
{
  "code": "hi",
  "state": "Hawaii",
  "grants": {
    "number": 18,
    "amount": 12817922
  },
  "contracts": {
    "number": 1,
    "amount": 1847682
  }
},
{
  "code": "ia",
  "state": "Iowa",
  "grants": {
    "number": 33,
    "amount": 21550698
  },
  "contracts": {
    "number": 2,
    "amount": 4596776
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
    "number": 0,
    "amount": 0
  },
  "contracts": {
    "number": 1,
    "amount": 608511
  }
},
{
  "code": "il",
  "state": "Illinois",
  "grants": {
    "number": 261,
    "amount": 122563413
  },
  "contracts": {
    "number": 9,
    "amount": 3537698
  },
  "institutions": [{
    "name": "Northwestern University at Chicago",
    "y": 46693206,
    "drilldown": "IL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IL_1',
      "data": [
        ["grants", 44809892],
        ["contracts",1883314]
      ]
    }
  }, {
    "name": "University of Chicago",
    "y": 40939500,
    "drilldown": "IL_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'IL_2',
      "data": [
        ["grants", 40939500]
       ]
    }
  }]
},
{
  "code": "in",
  "state": "Indiana",
  "grants": {
    "number": 76,
    "amount": 30461863
  },
  "contracts": {
    "number": 0,
    "amount": 219814
  },
  "institutions": [{
    "name": "Indiana University - Purdue Univ at Indianapolis",
    "y": 18367130,
    "drilldown": "IN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IN_1',
      "data": [
        ["grants", 18147316],
          ["contracts",219814]
       ]
    }
  }]
},
{
  "code": "ks",
  "state": "Kansas",
  "grants": {
    "number": 26,
    "amount": 11998336
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
    "number": 50,
    "amount": 21246792
  },
  "contracts": {
    "number": 2,
    "amount": 3746725
},
    "institutions": [{
    "name": "University of Kentucky",
    "y": 18279795,
    "drilldown": "KY_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'KY_1',
      "data": [
        ["grants", 18279795]
        ]
    }
  }]
},
{
  "code": "la",
  "state": "Louisiana",
  "grants": {
    "number": 33,
    "amount": 14444448
  },
  "contracts": {
    "number": 1,
    "amount": 1865938
  }
},
{
  "code": "ma",
  "state": "Massachusetts",
  "grants": {
    "number": 688,
    "amount": 387250776
  },
  "contracts": {
    "number": 8,
    "amount": 992491
  },
  "institutions": [{
    "name": "Beth Israel Deaconess Medical Center",
    "y": 19366554,
    "drilldown": "MA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_1',
      "data": [
        ["grants", 19366554]
      ]
    }
  }, {
    "name": "Brigham and Women's Hospital",
    "y": 54172687,
    "drilldown": "MA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_2',
      "data": [
        ["grants", 54172687]
      ]
    }
  }, {
    "name": "Dana-Farber Cancer Institute",
    "y": 128278405,
    "drilldown": "MA_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_3',
      "data": [
        ["grants", 128278405]
      ]
    }
  }, {
    "name": "Harvard University",
    "y": 17703558,
    "drilldown": "MA_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_4',
      "data": [
        ["grants", 17703558]
      ]
    }
  }, {
    "name": "Massachusetts General Hospital",
    "y": 58632520,
    "drilldown": "MA_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_5',
      "data": [
        ["grants", 58632520]
      ]
    }
  },{
    "name": "Massachusetts Institute of Technology",
    "y": 19891833,
    "drilldown": "MA_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_6',
      "data": [
        ["grants", 19891833]
      ]
    }
  }]
},
{
  "code": "md",
  "state": "Maryland",
  "grants": {
    "number": 170,
    "amount": 89796462
  },
  "contracts": {
    "number": 44,
    "amount": 579137174
  },
  "institutions": [{
    "name": "The Johns Hopkins University",
    "y": 76296119,
    "drilldown": "MD_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MD_1',
      "data": [
        ["grants", 69884144],
        ["contracts", 6411975]
         ]
    }
  }]
},
{
  "code": "me",
  "state": "Maine",
  "grants": {
    "number": 12,
    "amount": 5873691
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
    "number": 216,
    "amount": 102526223
  },
  "contracts": {
    "number": 4,
    "amount": 523107
  },
  "institutions": [{
    "name": "University of Michigan at Ann Arbor",
    "y": 67376941,
    "drilldown": "MI_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MI_1',
      "data": [
        ["grants", 67376941]
       ]
    }
  }]
},
{
  "code": "mn",
  "state": "Minnesota",
  "grants": {
    "number": 163,
    "amount": 109017613
  },
  "contracts": {
    "number": 4,
    "amount": 2869904
  },
  "institutions": [{
    "name": "Mayo Clinic in Rochester",
    "y": 62999400,
    "drilldown": "MN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MN_1',
      "data": [
        ["grants", 60331419],
        ["contracts", 2667981]
      ]
    }
  }, {
    "name": "University of Minnesota",
    "y": 36886971,
    "drilldown": "MN_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'MN_2',
      "data": [
        ["grants", 36886971]
      ]
    }
  }]
},
{
  "code": "mo",
  "state": "Missouri",
  "grants": {
    "number": 131,
    "amount": 68997217
  },
  "contracts": {
    "number": 90,
    "amount": 8384317
  },
  "institutions": [{
    "name": "Washington University",
    "y": 57345684,
    "drilldown": "MO_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MO_1',
      "data": [
        ["grants", 57345684]
       ]
    }
  }]
},
{
  "code": "ms",
  "state": "Mississippi",
  "grants": {
    "number": 3,
    "amount": 356314
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
    "amount": 2570251
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
    "number": 294,
    "amount": 154638939
  },
  "contracts": {
    "number": 3,
    "amount": 673536
  },
  "institutions": [{
    "name": "Duke University",
    "y": 49149899,
    "drilldown": "NC_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_1',
      "data": [
        ["grants", 49149899]
      ]
    }
  }, {
    "name": "University of North Carolina at Chapel Hill",
    "y": 66970860,
    "drilldown": "NC_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_2',
      "data": [
        ["grants", 66970860]
      ]
    }
  }, {
    "name": "Wake Forest University Health Sciences",
    "y": 21090644,
    "drilldown": "NC_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_3',
      "data": [
        ["grants", 20942319],
        ["contracts", 148325]
       ]
    }
  }]
},
{
  "code": "nd",
  "state": "North Dakota",
  "grants": {
    "number": 1,
    "amount": 168537
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
    "number": 49,
    "amount": 20988334
  },
  "contracts": {
    "number": 17,
    "amount": 493428
  },
  "institutions": [{
    "name": "University of Nebraska Medical Center",
    "y": 16626739,
    "drilldown": "NE_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NE_1',
      "data": [
        ["grants", 16626739]
        ]
    }
  }]
},
{
  "code": "nh",
  "state": "New Hampshire",
  "grants": {
    "number": 34,
    "amount": 18085623
  },
  "contracts": {
    "number": 1,
    "amount": 1499588
  }
  },
{
  "code": "nj",
  "state": "New Jersey",
  "grants": {
    "number": 74,
    "amount": 32867792
  },
  "contracts": {
    "number": 3,
    "amount": 7894468
  }
},
{
  "code": "nm",
  "state": "New Mexico",
  "grants": {
    "number": 24,
    "amount": 13924112
  },
  "contracts": {
    "number": 1,
    "amount": 2760430
  }
},
{
  "code": "nv",
  "state": "Nevada",
  "grants": {
    "number": 4,
    "amount": 1967244
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
    "number": 735,
    "amount": 382433170
  },
  "contracts": {
    "number": 5,
    "amount": 10421080
  },
  "institutions": [{
    "name": "Albert Einstein College of Medicine",
    "y": 15383157,
    "drilldown": "NY_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_1',
      "data": [
        ["grants", 15383157]
      ]
    }
  }, {
    "name": "Columbia University Health Sciences",
    "y": 47500334,
    "drilldown": "NY_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_2',
      "data": [
        ["grants", 47500334]
      ]
    }
  }, {
    "name": "Mount Sinai School of Medicine",
    "y": 30498931,
    "drilldown": "NY_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_3',
      "data": [
        ["grants", 30498931]
      ]
    }
  }, {
    "name": "New York University School of Medicine",
    "y": 36741880,
    "drilldown": "NY_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_4',
      "data": [
        ["grants", 36741880]
      ]
    }
  }, {
    "name": "Roswell Park Cancer Institute Corporation",
    "y": 29729330,
    "drilldown": "NY_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_5',
      "data": [
        ["grants", 29729330]
      ]
    }
  }, {
    "name": "Sloan-Kettering Institute for Cancer Research",
    "y": 112372447,
    "drilldown": "NY_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_6',
      "data": [
        ["grants", 112372447]
      ]
    }
  }, {
    "name": "Weill Medical Coll of Cornell Univ",
    "y": 29617952,
    "drilldown": "NY_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_7',
      "data": [
        ["grants", 29567957],
        ["contracts", 49995]
      ]
    }
  }]
},
{
  "code": "oh",
  "state": "Ohio",
  "grants": {
    "number": 238,
    "amount": 118977429
  },
  "contracts": {
    "number": 0,
    "amount": 159859
  },
  "institutions": [{
    "name": "Case Western Reserve University",
    "y": 31710175,
    "drilldown": "OH_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_1',
      "data": [
        ["grants", 31710175]
      ]
    }
  },
                   {
    "name": "Ohio State University",
    "y": 41444624,
    "drilldown": "OH_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_2',
      "data": [
        ["grants", 41284765],
        ["contracts", 159859]
      ]
    }
  },{
    "name": "The Research Institute at Nationwide Children's Hospital",
    "y": 19345898,
    "drilldown": "OH_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_3',
      "data": [
        ["grants", 19345898]
      ]
    }
  }]
},
{
  "code": "ok",
  "state": "Oklahoma",
  "grants": {
    "number": 34,
    "amount": 15950933
  },
  "contracts": {
    "number": 2,
    "amount": 969980
  }
},
{
  "code": "or",
  "state": "Oregon",
  "grants": {
    "number": 62,
    "amount": 51505556
  },
  "contracts": {
    "number": 20,
    "amount": 540738
  },
  "institutions": [{
    "name": "Oregon Health and Science University",
    "y": 47186907,
    "drilldown": "OR_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OR_1',
      "data": [
        ["grants", 47186907]
      ]
    }
  }]
},
{
  "code": "pa",
  "state": "Pennsylvania",
  "grants": {
    "number": 441,
    "amount": 316111135
  },
  "contracts": {
    "number": 56,
    "amount": 2374112
  },
  "institutions": [{
    "name": "Children's Hosp of Philadelphia",
    "y": 51012967,
    "drilldown": "PA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_1',
      "data": [
        ["grants", 51012967]
      ]
    }
  }, {
    "name": "ECOG-ACRIN Medical Research Foundation",
    "y": 35626613,
    "drilldown": "PA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_2',
      "data": [
        ["grants", 35626613]
      ]
    }
  }, {
    "name": "NRG Oncology Foundation, INC",
    "y": 29130178,
    "drilldown": "PA_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_3',
      "data": [
        ["grants", 29130178]
      ]
    }
  },
                   {
    "name": "University of Pennsylvania",
    "y": 81435270,
    "drilldown": "PA_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_4',
      "data": [
        ["grants", 81435270]
      ]
    }
  }, {
    "name": "University of Pittsburgh",
    "y": 40213041,
    "drilldown": "PA_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_5',
      "data": [
        ["grants", 40187098],
        ["contracts", 25943]
      ]
    }
  }, {
    "name": "Wistar Institute",
    "y": 19348403,
    "drilldown": "PA_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_6',
      "data": [
        ["grants", 19348403]
     ]
    }
  }]
},
{
  "code": "ri",
  "state": "Rhode Island",
  "grants": {
    "number": 23,
    "amount": 3830692
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
    "number": 59,
    "amount": 27878456
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "Medical University of South Carolina",
    "y": 17810813,
    "drilldown": "SC_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'SC_1',
      "data": [
        ["grants", 17810813]
       ]
    }
  }]
},
{
  "code": "sd",
  "state": "South Dakota",
  "grants": {
    "number": 3,
    "amount": 895016
  },
  "contracts": {
    "number": 2,
    "amount": 54210
  }
},
{
  "code": "tn",
  "state": "Tennessee",
  "grants": {
    "number": 165,
    "amount": 113019327
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "St. Jude Children's Research Hospital",
    "y": 41227827,
    "drilldown": "TN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_1',
      "data": [
        ["grants", 41227827]
      ]
    }
  }, {
    "name": "Vanderbilt University Medical Center",
    "y": 48593988,
    "drilldown": "TN_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_2',
      "data": [
        ["grants", 48593988]
      ]
    }
  }]
},
{
  "code": "tx",
  "state": "Texas",
  "grants": {
    "number": 523,
    "amount": 269261009
  },
  "contracts": {
    "number": 4,
    "amount": 5905334
  },
  "institutions": [{
    "name": "Baylor College of Medicine",
    "y": 41972894,
    "drilldown": "TX_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_1',
      "data": [
        ["grants", 41972894]
      ]
    }
  }, {
    "name": "University of Texas, MD Anderson Cancer Center",
    "y": 126714333,
    "drilldown": "TX_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_2',
      "data": [
        ["grants", 121108999],
          ["contracts",5605334]
      ]
    }
  }, {
    "name": "University of Texas, SW Medical Center at Dallas",
    "y": 54379692,
    "drilldown": "TX_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_3',
      "data": [
        ["grants", 54379692]
      ]
    }
  }]
},
{
  "code": "ut",
  "state": "Utah",
  "grants": {
    "number": 72,
    "amount": 27217721
  },
  "contracts": {
    "number": 2,
    "amount": 2096616
  },
  "institutions": [{
    "name": "University of Utah",
    "y": 28544587,
    "drilldown": "UT_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'UT_1',
      "data": [
        ["grants", 26447971],
        ["contracts", 2096616]
     ]
    }
  }]
},
{
  "code": "va",
  "state": "Virginia",
  "grants": {
    "number": 110,
    "amount": 53666798
  },
  "contracts": {
    "number": 8,
    "amount": 8320715
  },
  "institutions": [{
    "name": "University of Virginia",
    "y": 22458374,
    "drilldown": "VA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'VA_1',
      "data": [
        ["grants", 22458374]
     ]
    }
  }]
},
{
  "code": "vt",
  "state": "Vermont",
  "grants": {
    "number": 9,
    "amount": 3109791
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "wa",
  "state": "Washington",
  "grants": {
    "number": 222,
    "amount": 159115853
  },
  "contracts": {
    "number": 2,
    "amount": 5218561
  },
  "institutions": [{
    "name": "Fred Hutchinson Cancer Research Center",
    "y": 110446239,
    "drilldown": "WA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'WA_1',
      "data": [
        ["grants", 105505833],
        ["contracts", 4940406]
      ]
    }
  }, {
    "name": "University of Washington",
    "y": 28718882,
    "drilldown": "WA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'WA_2',
      "data": [
        ["grants", 28718882]
       ]
    }
  }]
},
{
  "code": "wi",
  "state": "Wisconsin",
  "grants": {
    "number": 100,
    "amount": 57597756
  },
  "contracts": {
    "number": 3,
    "amount": 1258957
  },
  "institutions": [{
    "name": "University of Wisconsin",
    "y": 30293015,
    "drilldown": "WI_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'WI_1',
      "data": [
        ["grants", 29061367],
          ["contracts",1231648]
      ]
    }
  }, {
    "name": "Medical College of Wisconsin",
    "y": 19903491,
    "drilldown": "WI_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'WI_2',
      "data": [
        ["grants", 19903491]
       ]
    }
  }]
},
{
  "code": "wv",
  "state": "West Virginia",
  "grants": {
    "number": 10,
    "amount": 4465386
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
      text: 'Grant and Contract Awards by State and Institution, FY 2019'
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
