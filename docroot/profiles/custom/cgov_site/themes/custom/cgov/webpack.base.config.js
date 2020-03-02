const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = {
  target: 'web',
  output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist/js'),
  },
  externals: {
    'jquery': 'jQuery',
    'jQuery': 'jQuery',
    'jquery-ui': 'jQuery.ui',
    'CDEConfig': 'CDEConfig'
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: ['babel-loader']
			},
			{
				test: /\.s?css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					'postcss-loader',
					'sass-loader'
				],
			},
			{
				test: /\.svg$/,
				use: [
					{
            loader: 'file-loader',
            options: {
              outputPath: '../images/sprites',
							name: '[name].[ext]',
              emitFile: false
            }
					}
				]
			}

		]
	},
    plugins: [
		new MiniCssExtractPlugin({
			filename: "../css/[name].css",
    }),
  ],
  watchOptions: {
    aggregateTimeout: 1000,
    poll: 300,
    ignored: [/node_modules/,/dist/,/sprites/]
  }
}

module.exports = config;
