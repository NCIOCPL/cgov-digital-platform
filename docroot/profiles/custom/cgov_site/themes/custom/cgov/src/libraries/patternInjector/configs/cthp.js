const overviewSettings = {
  str: '',
  options: {
      color: '#543ecd',
      generator: 'concentricCircles'
  }
};

const settings = {
  ".cthp-overview-title": overviewSettings,
  ".cthp-overview h2": overviewSettings,
  ".cthp-treatment h2": {
      str: '',
      options: {
          color: '#00c088',
          generator: 'sineWaves'
      }
  },
  ".cthp-research h2": {
      str: '',
      options: {
          color: '#1e7dc5',
          generator: 'tessellation'
      }
  },
  ".cthp-causes h2": {
      str: '',
      options: {
          color: '#8127a9',
          generator: 'nestedSquares'
      }
  },
  ".cthp-genetics h2": {
      str: '',
      options: {
          color: '#33ccb0',
          generator: 'xes'
      }
  },
  ".cthp-screening h2": {
      str: '',
      options: {
          color: '#c6395a',
          generator: 'triangles'
      }
  },
  ".cthp-survival h2": {
      str: '',
      options: {
          color: '#d6891a',
          generator: 'squares'
      }
  },
  ".cthp-general h2": {
      str: '',
      options: {
          color: '#119bb5',
          generator: 'octogons' // The library maker mispelled it in the source :p
      }
  },
  ".cthp-pink-feature h2": {
      str: '',
      options: {
          color: '#ce2daf',
          generator: 'mosaicSquares'
      }
  },
  ".cthp-yellow-feature h2": {
      str: '',
      options: {
          color: '#dbc416',
          generator: 'hexagons'
      }
  },
};

export default settings;
