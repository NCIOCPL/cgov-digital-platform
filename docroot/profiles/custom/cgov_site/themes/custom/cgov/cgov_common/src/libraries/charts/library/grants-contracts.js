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
    "number": 2,
    "amount": 563944
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
    "number": 59,
    "amount": 30570417
  },
  "contracts": {
    "number": 2,
    "amount": 3537176
  },
  "institutions": [{
    "name": "University of Alabama at Birmingham",
    "y": 28834558,
    "drilldown": "AL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'AL_1',
      "data": [
        ["grants", 25313353],
        ["contracts", 3521205]
      ]
    }
  },{
    "name": "Other",
    "y":    5273035,
    "drilldown": "AL_2",
    "drilldown_data": {
      "name": "Total",
      "id": "AL_2",
      "data": [
        ["grants", 5257064],
     ["contracts", 15971]
      ]
    }
  }]
},
{
  "code": "ar",
  "state": "Arkansas",
  "grants": {
    "number": 16,
    "amount": 6940579
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
    "number": 63,
    "amount": 35861750
  },
  "contracts": {
    "number": 1,
    "amount": 1252554
  },
  "institutions": [{
    "name": "University of Arizona",
    "y": 15656267,
    "drilldown": "AZ_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'AZ_1',
      "data": [
        ["grants", 14403713],
        ["contracts", 1252554]
       ]
    }
  },{
    "name": "Other",
    "y":   21458037,
    "drilldown": "AZ_2",
    "drilldown_data": {
      "name": "Total",
      "id": "AZ_2",
      "data": [
        ["grants", 21458037]
      ]
    }
  }]
},
{
  "code": "ca",
  "state": "California",
  "grants": {
    "number": 844,
    "amount": 495307530
  },
  "contracts": {
    "number": 18,
    "amount": 26611344
  },
  "institutions": [{
    "name": "Burnham Institute for Medical Research",
    "y": 17601843,
    "drilldown": "CA_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_1",
      "data": [
        ["grants", 17601843]
      ]
    }
  }, {
    "name": "City of Hope's Beckman Research Institute",
    "y": 39606193,
    "drilldown": "CA_2",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_2",
      "data": [
        ["grants", 39606193]
      ]
    }
  }, {
    "name": "Stanford University",
    "y": 70433861,
    "drilldown": "CA_3",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_3",
      "data": [
        ["grants", 70389024],
        ["contracts", 44837]
      ]
    }
  }, {
    "name": "University of  California San Francisco",
    "y": 85203576,
    "drilldown": "CA_4",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_4",
      "data": [
        ["grants", 85203576]
      ]
    }
  }, {
    "name": "University of California Davis",
    "y": 30126744,
    "drilldown": "CA_5",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_5",
      "data": [
        ["grants", 30126744]
      ]
    }
  }, {
    "name": "University of California Los Angeles",
    "y": 63843988,
    "drilldown": "CA_6",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_6",
      "data": [
        ["grants", 63843988]
      ]
    }
  }, {
    "name": "University of California San Diego",
    "y": 35703665,
    "drilldown": "CA_7",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_7",
      "data": [
        ["grants", 35703665]
      ]
    }
  },
    {
     "name": "University of Southern California",
    "y": 31196854,
    "drilldown": "CA_8",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_8",
      "data": [
        ["grants", 27357678],
        ["contracts", 3839176]
      ]
    }
  },
{
    "name": "Cedars-Sinai Medical Center",
    "y": 15053098,
    "drilldown": "CA_9",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_9",
      "data": [
        ["grants", 15053098]
      ]
    }
  },
                   {
    "name": "Kaiser Foundation Research Institute",
    "y": 16590755,
    "drilldown": "CA_10",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_10",
      "data": [
        ["grants", 16590755]
      ]
    }
  },{
    "name": "Other",
    "y":  116558297,
    "drilldown": "CA_11",
    "drilldown_data": {
      "name": "Total",
      "id": "CA_11",
      "data": [
        ["grants", 93830966],
          ["contracts", 22727331]
      ]
    }
  }]
},
{
  "code": "co",
  "state": "Colorado",
  "grants": {
    "number": 89,
    "amount": 36708457
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "University of Colorado Health Sciences Center",
    "y": 27144184,
    "drilldown": "CO_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CO_1",
      "data": [
        ["grants", 27144184]
        ]
    }
  },{
    "name": "Other",
    "y":   9564273,
    "drilldown": "CO_2",
    "drilldown_data": {
      "name": "Total",
      "id": "C0_2",
      "data": [
        ["grants", 9564273]
      ]
    }
  }]
},
{
  "code": "ct",
  "state": "Connecticut",
  "grants": {
    "number": 104,
    "amount": 49661202
  },
  "contracts": {
    "number": 2,
    "amount": 3084326
  },
  "institutions": [{
    "name": "Yale University",
    "y": 45415428,
    "drilldown": "CT_1",
    "drilldown_data": {
      "name": "Total",
      "id": "CT_1",
      "data": [
        ["grants", 45415428]
      ]
    }
  },{
    "name": "Other",
    "y":    7330100,
    "drilldown": "CT_2",
    "drilldown_data": {
      "name": "Total",
      "id": "CT_2",
      "data": [
        ["grants",  4245774],
          ["contracts", 3084326]
      ]
    }
  }]
},
{
  "code": "dc",
  "state": "District Of Columbia",
  "grants": {
    "number": 62,
    "amount": 26726691
  },
  "contracts": {
    "number": 5,
    "amount": 8312783
  },
  "institutions": [{
    "name": "Georgetown University",
    "y": 17268914,
    "drilldown": "DC_1",
    "drilldown_data": {
      "name": "Total",
      "id": "DC_1",
      "data": [
        ["grants", 17268914]
      ]
    }
  },{
    "name": "Other",
    "y":     17770560,
    "drilldown": "DC_2",
    "drilldown_data": {
      "name": "Total",
      "id": "DC_2",
      "data": [
        ["grants",   9457777],
          ["contracts",  8312783]
      ]
    }
  }]
},
{
  "code": "de",
  "state": "Delaware",
  "grants": {
    "number": 9,
    "amount": 5184312
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
    "number": 179,
    "amount": 83289572
  },
  "contracts": {
    "number": 3,
    "amount": 1542496
  },
  "institutions": [{
    "name": "H. Lee Moffitt Cancer Center & Research Institute",
    "y": 28709811,
    "drilldown": "FL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'FL_1',
      "data": [
        ["grants", 28709811]
      ]
    }
  }, {
    "name": "University of Florida",
    "y": 18902952,
    "drilldown": "FL_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'FL_2',
      "data": [
        ["grants", 18902952]
      ]
    }
  },{
    "name": "Other",
    "y":      37219305,
    "drilldown": "FL_3",
    "drilldown_data": {
      "name": "Total",
      "id": "FL_3",
      "data": [
        ["grants", 35676809],
          ["contracts", 1542496]
      ]
    }
  }]
},
{
  "code": "ga",
  "state": "Georgia",
  "grants": {
    "number": 106,
    "amount": 44609687
  },
  "contracts": {
    "number": 10,
    "amount": 5680383
  },
  "institutions": [{
    "name": "Emory University",
    "y": 26988675,
    "drilldown": "GA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'GA_1',
      "data": [
        ["grants", 24103373],
        ["contracts",  2885302]
        ]
    }
  },{
    "name": "Other",
    "y": 23301395,
    "drilldown": "GA_2",
    "drilldown_data": {
      "name": "Total",
      "id": "GA_2",
      "data": [
        ["grants", 20506314],
          ["contracts", 2795081]
      ]
    }
  }]
},
{
  "code": "hi",
  "state": "Hawaii",
  "grants": {
    "number": 15,
    "amount": 12662301
  },
  "contracts": {
    "number": 2,
    "amount": 1803055
  }
},
{
  "code": "ia",
  "state": "Iowa",
  "grants": {
    "number": 32,
    "amount": 21206096
  },
  "contracts": {
    "number": 2,
    "amount": 3871017
  },
  "institutions": [{
    "name": "University of Iowa",
    "y": 22440873,
    "drilldown": "IA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IA_1',
      "data": [
        ["grants", 18569856],
        ["contracts", 3871017]
       ]
    }
  },{
    "name": "Other",
    "y":  2636240,
    "drilldown": "IA_2",
    "drilldown_data": {
      "name": "Total",
      "id": "IA_2",
      "data": [
        ["grants", 2636240]
      ]
    }
  }]
},
{
  "code": "id",
  "state": "Idaho",
  "grants": {
    "number": 1,
    "amount": 68598
  },
  "contracts": {
    "number": 1,
    "amount": 628506
  }
},
{
  "code": "il",
  "state": "Illinois",
  "grants": {
    "number": 233,
    "amount": 109267974
  },
  "contracts": {
    "number": 7,
    "amount": 6637722
  },
  "institutions": [{
    "name": "Northwestern University at Chicago",
    "y": 51091192,
    "drilldown": "IL_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IL_1',
      "data": [
        ["grants", 51091192]
      ]
    }
  }, {
    "name": "University of Chicago",
    "y": 24497531,
    "drilldown": "IL_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'IL_2',
      "data": [
        ["grants", 24497531]
       ]
    }
  },{
    "name": "Other",
    "y":   39736756,
    "drilldown": "IL_3",
    "drilldown_data": {
      "name": "Total",
      "id": "IL_3",
      "data": [
        ["grants",  33099034],
          ["contracts", 6637722]
      ]
    }
  }]
},
{
  "code": "in",
  "state": "Indiana",
  "grants": {
    "number": 76,
    "amount": 35027843
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "Indiana University - Purdue Univ at Indianapolis",
    "y": 22558265,
    "drilldown": "IN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'IN_1',
      "data": [
        ["grants", 22558265]
       ]
    }
  },{
    "name": "Other",
    "y":  12469578,
    "drilldown": "IN_2",
    "drilldown_data": {
      "name": "Total",
      "id": "IN_2",
      "data": [
        ["grants",  12469578]
      ]
    }
  }]
},
{
  "code": "ks",
  "state": "Kansas",
  "grants": {
    "number": 27,
    "amount": 13857594
  },
  "contracts": {
    "number": 0,
    "amount": 300000
  }
},
{
  "code": "ky",
  "state": "Kentucky",
  "grants": {
    "number": 53,
    "amount": 19589278
  },
  "contracts": {
    "number": 2,
    "amount": 2701078
},
    "institutions": [{
    "name": "University of Kentucky",
    "y": 16706864,
    "drilldown": "KY_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'KY_1',
      "data": [
        ["grants", 14005786],
        ["contracts", 2701078]
        ]
    }
  },{
    "name": "Other",
    "y":   5583492,
    "drilldown": "KY_2",
    "drilldown_data": {
      "name": "Total",
      "id": "KY_2",
      "data": [
        ["grants", 5583492]
      ]
    }
  }]
},
{
  "code": "la",
  "state": "Louisiana",
  "grants": {
    "number": 24,
    "amount": 9399749
  },
  "contracts": {
    "number": 3,
    "amount": 1826274
  }
},
{
  "code": "ma",
  "state": "Massachusetts",
  "grants": {
    "number": 646,
    "amount": 409626512
  },
  "contracts": {
    "number": 6,
    "amount": 2912330
  },
  "institutions": [{
    "name": "Beth Israel Deaconess Medical Center",
    "y": 20216449,
    "drilldown": "MA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_1',
      "data": [
        ["grants", 20216449]
      ]
    }
  }, {
    "name": "Brigham and Women's Hospital",
    "y": 50367890,
    "drilldown": "MA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_2',
      "data": [
        ["grants", 50367890]
      ]
    }
  }, {
    "name": "Dana-Farber Cancer Institute",
    "y": 143236940,
    "drilldown": "MA_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_3',
      "data": [
        ["grants", 14323694]
      ]
    }
  }, {
    "name": "Harvard University",
    "y": 36040517,
    "drilldown": "MA_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_4',
      "data": [
        ["grants", 36040517]
      ]
    }
  }, {
    "name": "Massachusetts General Hospital",
    "y": 58003113,
    "drilldown": "MA_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_5',
      "data": [
        ["grants", 58003113]
      ]
    }
  },{
    "name": "Massachusetts Institute of Technology",
    "y": 20227684,
    "drilldown": "MA_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_6',
      "data": [
        ["grants", 20227684]
      ]
    }
  }, {
    "name": "Boston University Medical Campus",
    "y": 16842258,
    "drilldown": "MA_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'MA_7',
      "data": [
        ["grants", 16842258]
      ]
    }
  },{
    "name": "Other",
    "y": 70430470,
    "drilldown": "MA_8",
    "drilldown_data": {
      "name": "Total",
      "id": "MA_8",
      "data": [
        ["grants", 67518140],
           ["contracts", 2912330]
      ]
    }
  }]
},
{
  "code": "md",
  "state": "Maryland",
  "grants": {
    "number": 183,
    "amount": 95780180
  },
  "contracts": {
    "number": 43,
    "amount": 584851855
  },
  "institutions": [{
    "name": "The Johns Hopkins University",
    "y": 76440319,
    "drilldown": "MD_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MD_1',
      "data": [
        ["grants", 71838339],
        ["contracts", 4601980]
         ]
    }
  },{
    "name": "Other",
    "y":  604191716,
    "drilldown": "MD_2",
    "drilldown_data": {
      "name": "Total",
      "id": "MD_2",
      "data": [
        ["grants",  23941841],
           ["contracts", 580249875]
      ]
    }
  }]
},
{
  "code": "me",
  "state": "Maine",
  "grants": {
    "number": 11,
    "amount": 6228269
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
    "number": 203,
    "amount": 100210923
  },
  "contracts": {
    "number": 0,
    "amount": 205823
  },
  "institutions": [{
    "name": "University of Michigan at Ann Arbor",
    "y": 68691458,
    "drilldown": "MI_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MI_1',
      "data": [
        ["grants", 68691458]
       ]
    }
  },{
    "name": "Other",
    "y":   31725288,
    "drilldown": "MI_2",
    "drilldown_data": {
      "name": "Total",
      "id": "MI_2",
      "data": [
        ["grants", 31519465],
           ["contracts", 205823]
      ]
    }
  }]
},
{
  "code": "mn",
  "state": "Minnesota",
  "grants": {
    "number": 169,
    "amount": 118327648
  },
  "contracts": {
    "number": 3,
    "amount": 1429985
  },
  "institutions": [{
    "name": "Mayo Clinic in Rochester",
    "y": 75476676,
    "drilldown": "MN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MN_1',
      "data": [
        ["grants", 74232722],
        ["contracts", 1243954]
      ]
    }
  }, {
    "name": "University of Minnesota",
    "y": 32718206,
    "drilldown": "MN_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'MN_2',
      "data": [
        ["grants", 32718206]
      ]
    }
  },{
    "name": "Other",
    "y":    11562751,
    "drilldown": "MN_3",
    "drilldown_data": {
      "name": "Total",
      "id": "MN_3",
      "data": [
        ["grants", 11376720],
           ["contracts", 186031]
      ]
    }
  }]
},
{
  "code": "mo",
  "state": "Missouri",
  "grants": {
    "number": 103,
    "amount": 53239807
  },
  "contracts": {
    "number": 4,
    "amount": 5528628
  },
  "institutions": [{
    "name": "Washington University",
    "y": 46828382,
    "drilldown": "MO_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'MO_1',
      "data": [
        ["grants", 46828382]
       ]
    }
  },{
    "name": "Other",
    "y": 10611886,
    "drilldown": "MO_2",
    "drilldown_data": {
      "name": "Total",
      "id": "MO_2",
      "data": [
        ["grants",  6411425],
           ["contracts", 4200461]
      ]
    }
  }]
},
{
  "code": "ms",
  "state": "Mississippi",
  "grants": {
    "number": 1,
    "amount": 348844
  },
  "contracts": {
    "number": 2,
    "amount": 1416591
  }
},
{
  "code": "mt",
  "state": "Montana",
  "grants": {
    "number": 3,
    "amount": 1194767
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
    "number": 282,
    "amount": 158533585
  },
  "contracts": {
    "number": 2,
    "amount": 751602
  },
  "institutions": [{
    "name": "Duke University",
    "y": 52025405,
    "drilldown": "NC_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_1',
      "data": [
        ["grants", 52025405]
      ]
    }
  }, {
    "name": "University of North Carolina at Chapel Hill",
    "y": 60687076,
    "drilldown": "NC_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_2',
      "data": [
        ["grants", 60687076]
      ]
    }
  }, {
    "name": "Wake Forest University Health Sciences",
    "y": 19703480,
    "drilldown": "NC_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'NC_3',
      "data": [
        ["grants", 19608480],
        ["contracts", 95000]
       ]
    }
  },{
    "name": "Other",
    "y":  26869226,
    "drilldown": "NC_4",
    "drilldown_data": {
      "name": "Total",
      "id": "NC_4",
      "data": [
        ["grants", 26212624],
           ["contracts", 656602]
      ]
    }
  }]
},
{
  "code": "nd",
  "state": "North Dakota",
  "grants": {
    "number": 2,
    "amount": 293250
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
    "number": 51,
    "amount": 23802071
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "University of Nebraska Medical Center",
    "y": 19531041,
    "drilldown": "NE_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NE_1',
      "data": [
        ["grants", 19531041]
        ]
    }
  },{
    "name": "Other",
    "y":  4271030,
    "drilldown": "NE_2",
    "drilldown_data": {
      "name": "Total",
      "id": "NE_2",
      "data": [
        ["grants", 4271030]
      ]
    }
  }]
},
{
  "code": "nh",
  "state": "New Hampshire",
  "grants": {
    "number": 35,
    "amount": 16783404
  },
  "contracts": {
    "number": 1,
    "amount": 40000
  }
  },
{
  "code": "nj",
  "state": "New Jersey",
  "grants": {
    "number": 78,
    "amount": 32415289
  },
  "contracts": {
    "number": 2,
    "amount": 5921706
  }
},
{
  "code": "nm",
  "state": "New Mexico",
  "grants": {
    "number": 24,
    "amount": 15699477
  },
  "contracts": {
    "number": 1,
    "amount": 2484273
  }
},
{
  "code": "nv",
  "state": "Nevada",
  "grants": {
    "number": 3,
    "amount": 1939426
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
    "number": 719,
    "amount": 367857049
  },
  "contracts": {
    "number": 8,
    "amount": 9692337
  },
  "institutions": [{
    "name": "Albert Einstein College of Medicine",
    "y": 20762327,
    "drilldown": "NY_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_1',
      "data": [
        ["grants", 20300169],
        ["contracts", 462158]
      ]
    }
  }, {
    "name": "Columbia University Health Sciences",
    "y": 49588099,
    "drilldown": "NY_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_2',
      "data": [
        ["grants", 49588099]
      ]
    }
  }, {
    "name": "Mount Sinai School of Medicine",
    "y": 32188328,
    "drilldown": "NY_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_3',
      "data": [
        ["grants", 32188328]
      ]
    }
  }, {
    "name": "New York University School of Medicine",
    "y": 31579009,
    "drilldown": "NY_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_4',
      "data": [
        ["grants", 31579009]
      ]
    }
  }, {
    "name": "Roswell Park Cancer Institute Corporation",
    "y": 29457997,
    "drilldown": "NY_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_5',
      "data": [
        ["grants", 29457997]
      ]
    }
  }, {
    "name": "Sloan-Kettering Institute for Cancer Research",
    "y": 102117277,
    "drilldown": "NY_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_6',
      "data": [
        ["grants", 102117277]
      ]
    }
  }, {
    "name": "Weill Medical Coll of Cornell Univ",
    "y": 28503156,
    "drilldown": "NY_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'NY_7',
      "data": [
        ["grants", 27608211],
        ["contracts", 894945]
      ]
    }
  },{
    "name": "Other",
    "y":   83353306,
    "drilldown": "NY_8",
    "drilldown_data": {
      "name": "Total",
      "id": "NY_8",
      "data": [
        ["grants", 75017959],
           ["contracts",  8335347]
      ]
    }
  }]
},
{
  "code": "oh",
  "state": "Ohio",
  "grants": {
    "number": 236,
    "amount": 116756675
  },
  "contracts": {
    "number": 1,
    "amount": 359920
  },
  "institutions": [{
    "name": "Case Western Reserve University",
    "y": 31201865,
    "drilldown": "OH_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_1',
      "data": [
        ["grants", 31201865]
      ]
    }
  },
                   {
    "name": "Ohio State University",
    "y": 39963142,
    "drilldown": "OH_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_2',
      "data": [
        ["grants", 39848222],
        ["contracts", 114920]
      ]
    }
  },{
    "name": "The Research Institute at Nationwide Children's Hospital",
    "y": 16911562,
    "drilldown": "OH_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'OH_3',
      "data": [
        ["grants", 16911562]
      ]
    }
  },{
    "name": "Other",
    "y":  29040026,
    "drilldown": "OH_4",
    "drilldown_data": {
      "name": "Total",
      "id": "OH_4",
      "data": [
        ["grants",  28795026],
           ["contracts",   245000]
      ]
    }
  }]
},
{
  "code": "ok",
  "state": "Oklahoma",
  "grants": {
    "number": 30,
    "amount": 12480851
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "or",
  "state": "Oregon",
  "grants": {
    "number": 59,
    "amount": 43382263
  },
  "contracts": {
    "number": 0,
    "amount": 0
  },
  "institutions": [{
    "name": "Oregon Health and Science University",
    "y": 38492742,
    "drilldown": "OR_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'OR_1',
      "data": [
        ["grants", 38492742]
      ]
    }
  },{
    "name": "Other",
    "y":  4889521,
    "drilldown": "OR_2",
    "drilldown_data": {
      "name": "Total",
      "id": "OR_2",
      "data": [
        ["grants", 4889521]
      ]
    }
  }]
},
{
  "code": "pa",
  "state": "Pennsylvania",
  "grants": {
    "number": 437,
    "amount": 314446488
  },
  "contracts": {
    "number": 3,
    "amount": 1538462
  },
  "institutions": [{
    "name": "Children's Hosp of Philadelphia",
    "y": 56503614,
    "drilldown": "PA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_1',
      "data": [
        ["grants", 56503614]
      ]
    }
  }, {
    "name": "ECOG-ACRIN Medical Research Foundation",
    "y": 37797391,
    "drilldown": "PA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_2',
      "data": [
        ["grants", 37797391]
      ]
    }
  }, {
    "name": "NRG Oncology Foundation, INC",
    "y": 24572370,
    "drilldown": "PA_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_3',
      "data": [
        ["grants", 24572370]
      ]
    }
  }, {
    "name": "Research Institute of Fox Chase Cancer Center",
    "y": 14539532,
    "drilldown": "PA_4",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_4',
      "data": [
        ["grants", 14539532]
      ]
    }
  },
                   {
    "name": "University of Pennsylvania",
    "y": 67748741,
    "drilldown": "PA_5",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_5',
      "data": [
        ["grants", 67748741]
      ]
    }
  }, {
    "name": "University of Pittsburgh",
    "y": 53055300,
    "drilldown": "PA_6",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_6',
      "data": [
        ["grants", 53012850],
        ["contracts", 42450]
      ]
    }
  }, {
    "name": "Wistar Institute",
    "y": 19460435,
    "drilldown": "PA_7",
    "drilldown_data": {
      "name": "Total",
      "id": 'PA_7',
      "data": [
        ["grants", 19460435]
     ]
    }
  },{
    "name": "Other",
    "y":   42307567,
    "drilldown": "PA_8",
    "drilldown_data": {
      "name": "Total",
      "id": "PA_8",
      "data": [
        ["grants", 40811555],
           ["contracts",  1496012]
      ]
    }
  }]
},
{
  "code": "ri",
  "state": "Rhode Island",
  "grants": {
    "number": 13,
    "amount": 3737214
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
    "number": 54,
    "amount": 25910963
  },
  "contracts": {
    "number": 1,
    "amount": 25000
  },
  "institutions": [{
    "name": "Medical University of South Carolina",
    "y": 18591665,
    "drilldown": "SC_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'SC_1',
      "data": [
        ["grants", 18591665]
       ]
    }
  },{
    "name": "Other",
    "y":    7344298,
    "drilldown": "SC_2",
    "drilldown_data": {
      "name": "Total",
      "id": "SC_2",
      "data": [
        ["grants",  7319298],
           ["contracts", 25000]
      ]
    }
  }]
},
{
  "code": "sd",
  "state": "South Dakota",
  "grants": {
    "number": 1,
    "amount": 940075
  },
  "contracts": {
    "number": 0,
    "amount": 0
  }
},
{
  "code": "tn",
  "state": "Tennessee",
  "grants": {
    "number": 151,
    "amount": 102591686
  },
  "contracts": {
    "number": 2,
    "amount": 926468
  },
  "institutions": [{
    "name": "St. Jude Children's Research Hospital",
    "y": 31005912,
    "drilldown": "TN_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_1',
      "data": [
        ["grants", 31005912]
      ]
    }
  }, {
    "name": "Vanderbilt University Medical Center",
    "y": 49436928,
    "drilldown": "TN_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'TN_2',
      "data": [
        ["grants", 49436928]
      ]
    }
  },{
    "name": "Other",
    "y":     23075314,
    "drilldown": "TN_3",
    "drilldown_data": {
      "name": "Total",
      "id": "TN_3",
      "data": [
        ["grants",   22148846],
           ["contracts",  926468]
      ]
    }
  }]
},
{
  "code": "tx",
  "state": "Texas",
  "grants": {
    "number": 494,
    "amount": 242502527
  },
  "contracts": {
    "number": 3,
    "amount": 6781099
  },
  "institutions": [{
    "name": "Baylor College of Medicine",
    "y": 43511442,
    "drilldown": "TX_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_1',
      "data": [
        ["grants", 43511442]
      ]
    }
  }, {
    "name": "University of Texas, MD Anderson Cancer Center",
    "y": 103845733,
    "drilldown": "TX_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_2',
      "data": [
        ["grants", 103845733]
      ]
    }
  }, {
    "name": "University of Texas, SW Medical Center at Dallas",
    "y": 35034184,
    "drilldown": "TX_3",
    "drilldown_data": {
      "name": "Total",
      "id": 'TX_3',
      "data": [
        ["grants", 35034184]
      ]
    }
  },{
    "name": "Other",
    "y":  66892267,
    "drilldown": "TX_4",
    "drilldown_data": {
      "name": "Total",
      "id": "TX_4",
      "data": [
        ["grants", 60111168],
           ["contracts", 6781099]
      ]
    }
  }]
},
{
  "code": "ut",
  "state": "Utah",
  "grants": {
    "number": 75,
    "amount": 40344452
  },
  "contracts": {
    "number": 1,
    "amount": 1915502
  },
  "institutions": [{
    "name": "University of Utah",
    "y": 40210625,
    "drilldown": "UT_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'UT_1',
      "data": [
        ["grants", 38295123],
        ["contracts", 1915502]
     ]
    }
  },{
    "name": "Other",
    "y":   2049329,
    "drilldown": "UT_2",
    "drilldown_data": {
      "name": "Total",
      "id": "UT_2",
      "data": [
        ["grants", 2049329]
      ]
    }
  }]
},
{
  "code": "va",
  "state": "Virginia",
  "grants": {
    "number": 94,
    "amount": 44494804
  },
  "contracts": {
    "number": 13,
    "amount": 17546838
  },
  "institutions": [{
    "name": "University of Virginia",
    "y": 20007751,
    "drilldown": "VA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'VA_1',
      "data": [
        ["grants", 20007751]
     ]
    }
  },{
    "name": "Other",
    "y":   42033891,
    "drilldown": "VA_2",
    "drilldown_data": {
      "name": "Total",
      "id": "VA_2",
      "data": [
        ["grants",  24487053],
           ["contracts", 17546838]
      ]
    }
  }]
},
{
  "code": "vt",
  "state": "Vermont",
  "grants": {
    "number": 7,
    "amount": 3052333
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
    "number": 212,
    "amount": 137427059
  },
  "contracts": {
    "number": 3,
    "amount": 4674396
  },
  "institutions": [{
    "name": "Fred Hutchinson Cancer Research Center",
    "y": 100733239,
    "drilldown": "WA_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'WA_1',
      "data": [
        ["grants", 95605566],
        ["contracts", 5127673]
      ]
    }
  }, {
    "name": "University of Washington",
    "y": 20548727,
    "drilldown": "WA_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'WA_2',
      "data": [
        ["grants", 20548727]
       ]
    }
  },{
    "name": "Other",
    "y":    21525266,
    "drilldown": "WA_3",
    "drilldown_data": {
      "name": "Total",
      "id": "WA_3",
      "data": [
        ["grants",  21272766],
           ["contracts",  252500]
      ]
    }
  }]
},
{
  "code": "wi",
  "state": "Wisconsin",
  "grants": {
    "number": 89,
    "amount": 58749901
  },
  "contracts": {
    "number": 3,
    "amount": 2610418
  },
  "institutions": [{
    "name": "University of Wisconsin",
    "y": 26579464,
    "drilldown": "WI_1",
    "drilldown_data": {
      "name": "Total",
      "id": 'WI_1',
      "data": [
        ["grants", 26579464]
      ]
    }
  }, {
    "name": "Medical College of Wisconsin",
    "y": 25645730,
    "drilldown": "WI_2",
    "drilldown_data": {
      "name": "Total",
      "id": 'WI_2',
      "data": [
        ["grants", 25184262],
        ["contracts", 461468]
       ]
    }
  },{
    "name": "Other",
    "y":     9135125,
    "drilldown": "WI_3",
    "drilldown_data": {
      "name": "Total",
      "id": "WI_3",
      "data": [
        ["grants", 6986175],
           ["contracts", 2148950]
      ]
    }
  }]
},
{
  "code": "wv",
  "state": "West Virginia",
  "grants": {
    "number": 11,
    "amount": 4752189
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

function repositionModals(e){
  var windowWidth = window.document.body.getBoundingClientRect().width;
  popups.forEach(function(popup){
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

window.addEventListener('resize', repositionModals)

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
      text: 'Grant and Contract Awards by State and Institution, FY 2018'
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
              console.log("no institutions!")
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
                var message = "This state does not have any individual university or center receiving more than $15 million in NCI support."
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
};


export default {
  id,
  initChart,
};
