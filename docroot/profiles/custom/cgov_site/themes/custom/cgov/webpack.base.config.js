const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
    target: 'web',
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist/js'),
    },
    module: {
		rules: [
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

		]
	},
    plugins: [
		new MiniCssExtractPlugin({
			filename: "../styles/[name].css"
		}),
	],
}

module.exports = config;