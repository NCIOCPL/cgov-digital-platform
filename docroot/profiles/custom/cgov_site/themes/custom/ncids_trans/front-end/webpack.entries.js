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
	'ncids-mini-landing': path.resolve(
		__dirname,
		'src/entrypoints/ncids-mini-landing/ncids-mini-landing.ts'
	),
	'ncids-application-page-left-nav': path.resolve(
		__dirname,
		'src/entrypoints/ncids-application-page-left-nav/ncids-application-page-left-nav.ts'
	),
	'ncids-application-page-no-left-nav': path.resolve(
		__dirname,
		'src/entrypoints/ncids-application-page-no-left-nav/ncids-application-page-no-left-nav.ts'
	),
	'ncids-trans-common': path.resolve(
		__dirname,
		'src/entrypoints/ncids-trans-common/ncids-trans-common.ts'
	),
	'cancer-center': path.resolve(
		__dirname,
		'src/entrypoints/cancer-center/cancer-center.ts'
	),
	'press-release': path.resolve(
		__dirname,
		'src/entrypoints/press-release/press-release.ts'
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
	'addl-lib-test': path.resolve(__dirname, 'src/entrypoints/addl-lib-test/addl-lib-test.ts'),
	// addl-cancer-types-landing-page is an additional library
	// that can be added to a Home and Landing Page that contains
	// the CSS and JS that will be used on the Cancer Types Landing Page
	'addl-cancer-types-landing-page': path.resolve(
		__dirname,
		'src/entrypoints/addl-cancer-types-landing-page/addl-cancer-types-landing-page.ts'
	),
};
