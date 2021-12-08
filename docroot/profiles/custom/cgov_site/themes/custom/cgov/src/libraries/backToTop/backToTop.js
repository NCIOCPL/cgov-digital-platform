import $ from 'jquery';
import { throttle } from 'throttle-debounce';

function _initialize() {
	// set the pixel value (from the top of the page) of where the arrow should begin to appear
	const offset = 600;
	// set the duration of the fade in effect of the back to top arrow and text
	const duration = 500;

	const $element = $('.back-to-top');

	var handleScroll = function(){
		// using pageYOffset for IE11 - https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
		if (window.pageYOffset > offset) {
				$element.fadeIn(duration, function () {
					$element.trigger("reveal");
				});
		} else {
				$element.fadeOut(duration);
		}
	};

	var throttledHandleScroll = throttle(100,handleScroll);

	window.addEventListener('scroll', throttledHandleScroll, {
		capture: true,
		passive: true
	});

	$element.click(function (e) {
		e.preventDefault();
		// animate to top
		$('html, body').animate({
			scrollTop: 0
		}, 400);
	});
}

let initialized = false;
export default function(){
	if(initialized) {
		return;
	}

	initialized = true;
	_initialize();
}
