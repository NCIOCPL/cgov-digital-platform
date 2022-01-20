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
  Styles: path.resolve(__dirname, '../../cgov/cgov_common/src/styles'),
  Libraries: path.resolve(__dirname, '../../cgov/cgov_common/src/libraries'),
  // This is used to reference sprites.
  ImageDist: path.resolve(__dirname, "../dist/images"),
}

// These should not really be used. Aliases are bad for intellesense.
const ncidsImports = {};

module.exports = {
  ...legacyImports,
  ...ncidsImports,
};
