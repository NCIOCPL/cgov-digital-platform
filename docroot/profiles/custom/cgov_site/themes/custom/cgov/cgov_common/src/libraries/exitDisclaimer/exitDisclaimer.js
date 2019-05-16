import $ from 'jquery';
/*** BEGIN Exit Disclaimer
 * This script looks for URLs where the href points to websites
 * not in the federal domain (.gov) and if it finds one, it appends
 * an image to the link. The image itself links to the exit
 * disclaimer page.
 * Changed code to exclude the exit icon from images within the anchor tag.
 ***/
function _initialize() {
	var lang = $('html').attr('lang') || 'en',
		path,
		altText;

	switch (lang) {
	case 'es':
		path = $('meta[name="espanol-linking-policy"]').prop('content');
		altText = 'Notificaci\u00F3n de salida';
		break;
	default:
		path = $('meta[name="english-linking-policy"]').prop('content');
		altText = 'Exit Disclaimer';
		break;
	}
	// Looks for all non .gov links (that do not include an image immediately inside the anchor tag) and adds external link href aftr the link.
	$("a[href]:not(:has(>img))").filter(function () {
    return /^https?\:\/\/([a-zA-Z0-9\-]+\.)+/i.test(this.href)
      && !/^https?\:\/\/([a-zA-Z0-9\-]+\.)+gov/i.test(this.href)
      && !/^https?\:\/\/([a-zA-Z0-9\-]+\.)+acquia-sites\.com/i.test(this.href)
      && !/^https?\:\/\/([a-zA-Z0-9\-]+\.)+acsitefactory\.com/i.test(this.href)
      && this.href !== ""
      && this.href.indexOf(location.protocol + '//' + location.hostname) !== 0
      && !$(this).hasClass('add_this_btn')
      && !$(this).hasClass('toolbar-item') // Drupal admin toolbar selector
      && !$(this).hasClass('no-exit-notification');
	}).after($(
		'<a class="icon-exit-notification" title="' + altText + '" href="' + path + '">' +
		'<span class="hidden">' + altText + '</span>' +
		'</a>'
	));

	// move the feature card exit notification within the dom to come right after the image in the feature card to meet design request, WCMSFEQ-282
	$('.feature-card a.icon-exit-notification').insertAfter('.feature-card a:not([href^="/"]):not([href*=".gov"]) div img');
};

let initialized = false;
export default function() {
	if(initialized)
		return;

	initialized = true;
	_initialize();
}
/*** END Exit Disclaimer ***/
