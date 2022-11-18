// This config is just for the module rules and such. Aliases and entrypoints are
// in anther castle.
const path = require('path');
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const entry = require('./webpack.entries.js');
const alias = require('./webpack.alias.js');
const { SourceMapDevToolPlugin } = require('webpack');

module.exports = (env, argv) => {
	const config = {
		entry,
		output: {
			filename: './js/[name].js',
			path: path.join(__dirname, '../dist'),
			// We cannot do a cleanup here as we need the legacy sprite copied in
			// here before the build.
			clean: false,
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js'],
			// For some reason without the node_modules path, node_modules was not in the resolution
			// paths. The is probably because the code sources are in a tree of folders outside of
			// this module, meaning outside of our package.json.
			modules: [
				path.resolve(__dirname, '../src'),
				path.resolve(__dirname, './node_modules'),
			],
			alias,
		},
		externals: {
			jquery: 'jQuery',
			jQuery: 'jQuery',
			'jquery-ui': 'jQuery.ui',
			CDEConfig: 'CDEConfig',
		},
		// passes sourcemap control to SourceMapDevToolPlugin
		devtool: false,
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
						path.resolve(__dirname, '../../cgov/cgov_common/src'),
					],
				},
				{
					// Allow semi-legacy entry points. This stuff is going to
					// reference a lot of untyped JS from the legacy core AND
					// jquery madness.
					test: /\.js$/,
					use: 'babel-loader',
					exclude: /node_modules/,
					include: [path.resolve(__dirname, './src/entrypoints')],
				},
				{
					// Run all typescript through babel, which sends it to the TS
					// compiler for us.
					test: /\.(ts)x?$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					include: [path.resolve(__dirname, './src')],
				},
				{
					// This rule handles any scss call from our .js/ts files.
					test: /\.s?css$/,
					use: [
						// The extract plugin removes the CSS from the .js/ts files and puts it into a
						// file with the same name as the calling .js/ts file. The calling js is usually
						// one of our entry points in webpack.entries.js.
						MiniCssExtractPlugin.loader,
						// Calls the CSS loader to rewrite url() calls with a "better" path. Better in
						// this case usually means one that is going to work on the web site. This does
						// most of the work fixing up the sprite location.
						{
							loader: 'css-loader',
							options: {
								url: {
									filter: (uri) => {
										// Ignore absolute paths. (Legacy stuff)
										if (uri.startsWith('/')) {
											return false;
										} else if (uri.includes('/usa-icons-bg/')) {
											// Temp hack for ncids
											return false;
										}
										return true;
									},
								},
								sourceMap: true,
							},
						},
						// Run postcss on the transformed files. This is mostly to add vendor prefixing
						// to the generated CSS.
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									// If we don't force a config here postcss seemingly trys to find the
									// closest postcss config to the sass you are loading, and in cgov_common
									// that is a bad thing.
									config: path.resolve(__dirname, './postcss.config.js'),
								},
								sourceMap: true,
							},
						},
						// Call the sass loader to process any .scss file called from .js/ts.
						// NOTE: subsequent calls to other sass partials from this call will
						// be resolved through node-sass and NOT webpack.
						{
							loader: 'sass-loader',
							options: {
								sassOptions: {
									includePaths: [path.resolve(__dirname, './node_modules')],
									sourceMap: true,
								},
							},
						},
					],
				},
				// Legacy Sprites Here
				// This rule handles rewriting the sprite URI for url() calls in the sass/css files.
				{
					test: /\/svg-sprite\.svg$/,
					type: 'asset/resource',
					generator: {
						emit: false,
						filename: '[name][ext]?v=[hash]',
						publicPath: '../images/sprites/',
					},
				},
				// NCIDS/USWDS Sprites (assume other svgs that actually exist)
				{
					test: /\.svg$/,
					// Temporarily let's inline these things.
					dependency: { not: ['url'] },
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 8192,
							},
						},
					],
				},
			],
		},
		optimization: {
			minimizer: [
				// For webpack@5 you can use the `...` syntax to extend existing
				// minimizers (i.e. `terser-webpack-plugin`)
				`...`,
				new CssMinimizerPlugin(),
			],
		},
		watchOptions: {
			aggregateTimeout: 1000,
			poll: 300,
			ignored: ['**/node_modules'],
		},
		plugins: [
			new ESLintPlugin({
				extensions: ['js', 'ts'],
				context: __dirname,
				overrideConfigFile: './.eslintrc.js',
				exclude: ['node_modules', '../../cgov/**'],
			}),
			// This is to actually do Typescript type checking. Babel loader does not
			// give any errors related to type checking.
			new ForkTsCheckerWebpackPlugin(),
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				openAnalyzer: false,
			}),
			// This is a stupid hack to copy our static version of jquery ui. We have
			// a static version cause Drupal only half-heartedly includes jQuery UI,
			// enough that us importing certain packages does not work right.
			// We do not build it via entrypoints cause that did not work correctly.
			// We really want to stop using it altogether and when NCIDS is finally
			// finished, we won't. So this hack is going to be here for a while.
			new CopyPlugin({
				patterns: [
					{
						from: path.resolve(__dirname, './static/js'),
						to: './js',
					},
				],
			}),
			new MiniCssExtractPlugin({
				filename: './css/[name].css',
				// This little fella is required unless you want to spend hours figuring out
				// why css-loader/webpack does not generate correct paths for sprites.
				experimentalUseImportModule: false,
			}),
			// Don't want to make separate configs just to disable this in prod. Since we
			// pass the mode into webpack in package.json, this should work for now
			...(argv.mode === 'development'
				? [
						new SourceMapDevToolPlugin({
							filename: '[file].map',
							columns: false,
							module: true,
						}),
				  ]
				: []),
		],
	};

	return config;
};
