const postcss = require('postcss');

/* This is a custom postcss-loader that is designed specifically to target drupal with a query param */
const cachekiller = postcss.plugin('cachekiller', function cachekiller(options = {}) {
    return function (css) {
        css.replaceValues(/url\(['|"].+\.\w+['|"]\)/, string => {
            return string.replace(/(url\(['|"])(.+\.\w+)(['|"]\))/, (full, pre, match, post) => `${pre}${match}${'?v=' + Date.now().toString().slice(0,-5)}${post}`)
        })
    }
});

module.exports = {
    plugins: [
      require('autoprefixer'),
      cachekiller(),
    ]
}
