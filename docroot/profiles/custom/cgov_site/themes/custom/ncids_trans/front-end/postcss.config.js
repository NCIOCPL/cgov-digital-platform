module.exports = {
  plugins: [
    [
      'postcss-prefix-selector',
      {
        prefix: '.cgdpl',
        transform(prefix, selector, prefixedSelector, filepath) {
          if (filepath.match(/-legacy\.scss$/)) {
            return prefixedSelector;
          }
          return selector;
        },
      },
    ],
    [
      'autoprefixer'
    ]
  ]
};
