import $ from 'jquery';
import MegaMenu from 'Core/external/jquery-accessibleMegaMenu';
import { debounce } from 'throttle-debounce';
import './megamenu.scss';

function _initialize() {
	/*** BEGIN Mega Menu init
	 *** (initialize a selector as an accessibleMegaMenu)
	***/
	MegaMenu($, window, document);

	var megaNav = $("#mega-nav");

	megaNav.accessibleMegaMenu({
		/* prefix for generated unique id attributes, which are
			* required to indicate aria-owns, aria-controls and aria-labelledby
			*/
		uuidPrefix: "accessible-megamenu",

		/* css class used to define the megamenu styling */
		menuClass: "nav-menu",

		/* css class for a top-level navigation item in the megamenu */
		topNavItemClass: "nav-item",

		/* css class for a megamenu panel */
		panelClass: "sub-nav-mega",

		/* css class for a group of items within a megamenu panel */
		panelGroupClass: "sub-nav-group",

		/* css class for the hover state */
		hoverClass: "hover",

		/* css class for the focus state */
		focusClass: "focus",

		/* css class for the open state */
		openClass: "open"
	});

	megaNav.find(".sub-nav-group-wrapper").bind("mouseleave",function(e){
		if($(e.relatedTarget).is('.sub-nav-mega')){
			$(this).closest(".nav-menu").trigger("mouseout");
		}
	}).each(function(){
		var $this = $(this);
		if ($this.outerHeight() > 300) {
			$this.parent().addClass("mega-menu-scroll");
		}
	});

	// **** PATCH
	// The megaMenu does not work correctly when it's initialized in hidden, tablet mode.
	// This reinitializes the megaMenu, only once, while preserving the original settings when going
	// from tablet to desktop mode.
	if(window.matchMedia("(max-width: 1024px)").matches){
		// Self-expiring listener
		const resizeHandler = () => {
			if(window.matchMedia("(min-width: 1025px)").matches){
				$.data(megaNav, "plugin_accessibleMegaMenu").init();
				window.removeEventListener("resize", debouncedResizeHandler);
			}
		}

		const debouncedResizeHandler = debounce(300, resizeHandler)
		window.addEventListener("resize", debouncedResizeHandler);
	}
	// **** END PATCH

	// create a class for mega menu items that have no actual content, so we can unformat them
	$(document).ready(function() {
		$(".sub-nav-mega").each(function(){
			if (!$(this).text().trim().length) {
				$(this).addClass("empty-mega");
			}
		})
	});
}

/**
 * Exposed functions of this module.
 */
let _initialized = false;
export default function() {
	if (!_initialized) {
		_initialized = true;
		_initialize();
	}
}
/*** END Mega Menu init ***/
