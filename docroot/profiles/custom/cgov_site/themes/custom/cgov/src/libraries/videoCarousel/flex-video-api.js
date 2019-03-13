/**
*   1) The enablejsapi attribute is set
*   2) A script tag for the YouTube iframe API is added to the dom
* This allows us to interact with the YouTube API and fire off events using the 'YT' object.
*/
import $ from 'jquery';

// Create a script tag on the dom that references the iframe API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

/**
 * Initialize the embedded YouTube iframe.
 */
function _initialize($parent) {

	if(typeof($parent) == 'undefined')
		$parent = $('body');

	$parent.find('.flex-video').each(function() {
			var $this = $(this);
			var lang = $('html').attr('lang') || 'en';
			var contentLanguage = document.documentElement.lang;
			var hl = '&hl=en';
			if(contentLanguage.indexOf('es') > -1){
				hl = '&hl=es';
			}

			// remove old player object for onYouTubeIframeAPIReady events
			$('#flex-video-api').removeAttr("id");

			var videoSrc = '//www.youtube-nocookie.com/embed/',
				videoLinkSrc = 'https://www.youtube.com/',
				videoId = '',
				videoTitle = '',
				videoOptions = '?wmode=opaque&rel=0&enablejsapi=1' + hl,
				videoType = '';

			if($this.hasClass('playlist')) {
				videoType = 'playlist';
				videoTitle = $this.attr('data-playlist-title');
				videoId = 'videoseries';
				videoOptions = videoOptions +
					'&list=' + $this.attr('data-playlist-id');
				videoLinkSrc = videoLinkSrc + 'playlist?list=' + videoId;
			} else {
				videoType = 'video';
				videoTitle = $this.attr('data-video-title');
				videoId = $this.attr('data-video-id');
				videoOptions = videoOptions +
					'';
				videoLinkSrc = videoLinkSrc + 'watch?v=' + videoId;
			}
			videoSrc = videoSrc + videoId + videoOptions;
			var videoText = {
				video: {
					en: 'Youtube embedded video: ' + videoLinkSrc,
					es: 'Video insertado desde YouTube: ' + videoLinkSrc
				},
				playlist: {
					en: 'Youtube embedded video playlist: ' + videoLinkSrc,
					es: 'Lista de reproducci&oacute;n insertada desde YouTube: ' + videoLinkSrc
				}
			};
			$this.append(
				$(document.createElement('iframe'))
					.attr('width', '560')
					.attr('height', '315')
					.attr('src', videoSrc)
					.attr('frameborder', '0')
					.attr('allowFullScreen', '')
					.attr('title', videoTitle)
					.attr('alt', videoTitle)
					.attr('id', 'flex-video-api')
					.attr('enablejsapi', '1')
					.text(videoText[videoType][lang])
			);
		});
}

export default {
	init: _initialize
}
