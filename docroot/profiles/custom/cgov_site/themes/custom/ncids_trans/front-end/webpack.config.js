// This config is just for the module rules and such. Aliases and entrypoints are
// in anther castle.
const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const entry = require("./webpack.entries.js");
const alias = require("./webpack.alias.js");

const config = {
  entry,
  output: {
    filename: './js/[name].js',
    path: path.join(__dirname, "dist"),
    // Cleans up the dist folder before doing the build.
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // For some reason without the node_modules path, node_modules was not in the resolution
    // paths. The is probably because the code sources are in a tree of folders outside of
    // this module.
    modules: [path.resolve(__dirname, "../src"), path.resolve(__dirname, "./node_modules")],
    alias
  },
  externals: {
    jquery: "jQuery",
    jQuery: "jQuery",
    "jquery-ui": "jQuery.ui",
    CDEConfig: "CDEConfig"
  },
  module: {
    rules: [
      {
      // Only allow js in the legacy code. Any JS in our theme is
      // forbidden.
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, '../../cgov/src'),
          path.resolve(__dirname, '../../cgov/cgov_common/src')
        ]
      },
      {
        // Allow semi-legacy entry points. This stuff is going to
        // reference a lot of untyped JS from the legacy core AND
        // jquery madness.
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, './src/entrypoints'),
        ]
      },
      {
        // Run all typescript through babel, which sends it to the TS
        // compiler for us.
        test: /\.(ts)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, './src'),
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
      //{
      //  test: /\.svg$/,
      //  use: 'file-loader'
      //}
    ]
  },
  optimization: {
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing
      // minimizers (i.e. `terser-webpack-plugin`)
      `...`,
      new CssMinimizerPlugin(),
    ]
  },
  watchOptions: {
    aggregateTimeout: 1000,
    poll: 300,
    ignored: ['**/node_modules'],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
    }),
  ]
};

module.exports = config;
