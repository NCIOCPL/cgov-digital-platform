/***
 * @file
 * Declaration of application entrypoints.
 */

const path = require('path');

module.exports = {
	'ncids-common': path.resolve(
		__dirname,
		'src/entrypoints/global/ncids-common.ts'
	),
	'ncids-minimal': path.resolve(
		__dirname,
		'src/entrypoints/global/ncids-minimal.ts'
	),
	ckeditor: path.resolve(__dirname, 'src/entrypoints/ckeditor/ckeditor.js'),
	article: path.resolve(__dirname, 'src/entrypoints/article/article.ts'),
	'home-landing': path.resolve(
		__dirname,
		'src/entrypoints/home-landing/home-landing.ts'
	),
	'special-report': path.resolve(
		__dirname,
		'src/entrypoints/special-report/special-report.ts'
	),
	'ncids-home-landing': path.resolve(
		__dirname,
		'src/entrypoints/ncids-home-landing/ncids-home-landing.ts'
	),
	pdq: path.resolve(__dirname, 'src/entrypoints/pdq/pdq.ts'),
	'mini-landing': path.resolve(
		__dirname,
		'src/entrypoints/mini-landing/mini-landing.ts'
	),
	'cancer-center': path.resolve(
		__dirname,
		'src/entrypoints/cancer-center/cancer-center.ts'
	),
	blogs: path.resolve(__dirname, 'src/entrypoints/blogs/blogs.ts'),
	biography: path.resolve(__dirname, 'src/entrypoints/biography/biography.ts'),
	cthp: path.resolve(__dirname, 'src/entrypoints/cthp/cthp.ts'),
	event: path.resolve(__dirname, 'src/entrypoints/event/event.ts'),
	'r4r-app': path.resolve(__dirname, 'src/entrypoints/r4r/r4r-app.js'),
	'app-module': path.resolve(
		__dirname,
		'src/entrypoints/app-module/app-module.ts'
	),
};
