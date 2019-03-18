/*** BEGIN deeplinking fix
 * This script fixes the scroll position for deeplinking.
 ***/
import $ from 'jquery';
import './jquery.nci.scroll_to';

function _initialize() {
	// console.log("You are using: " + browserDetect.getBrowser() + " with version: " + browserDetect.getVersion());

	$(window).on('load.deeplink hashchange.deeplink', function(event) {
		event.preventDefault();
		// putting scroll in document.ready event in order to move it to the bottom of the queue on load
		$(document).ready(function() {
			_doScroll(event);
		});
	});

	$(document).ready(function() {
		//redundant check to see if anchor is same as current hash
		//if it is the same then trigger doScroll since a hashchange will not be triggered
		$("#content").on('click.deeplink',"a[href*=\\#]",function(e) {
			// click event triggers hash scroll, hashchange moves page to make room for fixed header, minor visual jank is visible
			// hashchange can be triggered outside click events
			// we don't want the hashchange event to be fired if an anchor tag is clicked

			// $('.headroom-area').addClass('frozen');

			var anchor = this.attributes.href.value;
			if(anchor === location.hash){
				e.preventDefault();
				_doScroll(e);
			}
		});
	});
}

function _doScroll(event){
	if(location.hash !== '') {

		$('.headroom-area').addClass('frozen');

		var isSection = location.hash.match(/^#section\//i),
			anchor = ('#' + location.hash.replace(/^.+\//, '').replace(/([\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g, '\\$1')).replace('#\\', ''),
			$anchor = $(anchor),
			$accordionPanel = (isSection) ? $anchor.children('.ui-accordion-content') : $anchor.closest('.ui-accordion-content'),
			$accordion = $accordionPanel.closest('.ui-accordion'),
			accordionIndex = ($accordion.length > 0) ? $accordion.data('ui-accordion').headers.index($accordionPanel.prev('.ui-accordion-header')) : undefined,
			scroll = function (el) {
				$(window).NCI_scroll_to({
					isSection: isSection,
					anchor: el,
					event: event.type
				});
			}
		;

		if($accordion.length > 0) {
			// subscribe to accordion activate events to trigger scroll
			$accordion.on('accordionactivate', function(e) { scroll(anchor); });

			// check if the target panel is active. Yes, scroll to it : No, trigger it and callback will scroll
			if(!$accordionPanel.hasClass('accordion-content-active')) {
				$accordion.accordion('option', 'active', accordionIndex);
			} else {
				scroll(anchor);
			}
		} else {
			scroll(anchor);
		}

	}
}

let initialized = false;
export default function() {
	if (initialized) {
		return;
	}

	initialized = true;
	_initialize();
}
/*** END deeplinking fix ***/
