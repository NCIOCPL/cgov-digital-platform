/***
 * @file
 * Declaration of application entrypoints.
 */

const path = require("path");

// Legacy imports from cgov_common until it has been completely
// removed from this new theme.
const legacyImports = {
  Core: path.resolve(__dirname, '../../cgov/src'),
  Utilities: path.resolve(__dirname, '../../cgov/src/utilities'),
  Polyfills: path.resolve(__dirname, '../../cgov/src/polyfills'),
  // The only thing in styles is the sprite. So we can point this at our
  // local copy.
	'Styles/sprites': path.resolve(__dirname, './src/legacy/legacy-sprites'),
  Libraries: path.resolve(__dirname, '../../cgov/cgov_common/src/libraries'),
  // This is used to reference sprites.
  ImageDist: path.resolve(__dirname, "../dist/images"),
}

// These should not really be used. Aliases are bad for intellesense.
const ncidsImports = {
  // hack to resolve uswds images?
  "uswds": path.resolve(__dirname, './node_modules/uswds')
};

module.exports = {
  ...legacyImports,
  ...ncidsImports,
};
