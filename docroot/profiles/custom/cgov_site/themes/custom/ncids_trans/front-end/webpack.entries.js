/***
 * @file
 * Declaration of application entrypoints.
 */

const path = require('path');

module.exports = {
	Common: path.resolve(__dirname, 'src/entrypoints/global/Common.js'),
	'ncids-common': path.resolve(
		__dirname,
		'src/entrypoints/global/ncids-common.ts'
	),
	ckeditor: path.resolve(__dirname, 'src/entrypoints/ckeditor/ckeditor.js'),
	article: path.resolve(__dirname, 'src/entrypoints/article/article.js'),
	'home-landing': path.resolve(
		__dirname,
		'src/entrypoints/home-landing/home-landing.js'
	),
	'special-report': path.resolve(
		__dirname,
		'src/entrypoints/special-report/special-report.js'
	),
	pdq: path.resolve(__dirname, 'src/entrypoints/pdq/pdq.js'),
	'mini-landing': path.resolve(
		__dirname,
		'src/entrypoints/mini-landing/mini-landing.js'
	),
	'cancer-center': path.resolve(
		__dirname,
		'src/entrypoints/cancer-center/cancer-center.js'
	),
	'blog-post': path.resolve(
		__dirname,
		'src/entrypoints/blog-post/blog-post.js'
	),
	'blog-series': path.resolve(
		__dirname,
		'src/entrypoints/blog-series/blog-series.js'
	),
	biography: path.resolve(__dirname, 'src/entrypoints/biography/biography.js'),
	cthp: path.resolve(__dirname, 'src/entrypoints/cthp/cthp.js'),
	event: path.resolve(__dirname, 'src/entrypoints/event/event.js'),
	//'cts-app': path.resolve(__dirname, 'src/entrypoints/cts/cts-app.js'),
	//'r4r-app': path.resolve(__dirname, 'src/entrypoints/r4r/r4r-app.js'),
};
