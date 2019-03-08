import $ from 'jquery';
import 'jquery-ui';
import * as config from 'Core/libraries/nciConfig/NCI.config';

//TODO: Require breakpoints

/*======================================================================================================
* function doAccordion
*
*  will generate an accordion using jQuery UI
*
* returns: null
* parameters:
*  target[]    (string)(jQuery selector)    Selector of the div to be accordionized.
*  opts{}      (object)                     Options to pass to jQuery UI's accordion function.
*
*====================================================================================================*/
export function doAccordion(target, opts) {
	var $target = $(target);
	var defaultOptions = {
		heightStyle: "content",
		header: "h2",
		collapsible: true,
		active: false,
		/* override default functionality of accordion that only allows for a single pane to be open
			* original source: http://stackoverflow.com/questions/15702444/jquery-ui-accordion-open-multiple-panels-at-once */
		beforeActivate: function (event, ui) {
			var icons = $(this).accordion('option', 'icons');
			// The accordion believes a panel is being opened
			var currHeader;
			if (ui.newHeader[0]) {
				currHeader = ui.newHeader;
				// The accordion believes a panel is being closed
			} else {
				currHeader = ui.oldHeader;
			}
			var currContent = currHeader.next('.ui-accordion-content');
			// Since we've changed the default behavior, this detects the actual status
			var isPanelSelected = currHeader.attr('aria-selected') == 'true';

			// Toggle the panel's header
			currHeader.toggleClass('ui-corner-all', isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top', !isPanelSelected).attr('aria-selected', (!isPanelSelected).toString()).attr('aria-expanded', (!isPanelSelected).toString());

			// Toggle the panel's icon if the active and inactive icons are different
			if(icons.header !== icons.activeHeader) {
				currHeader.children('.ui-icon').toggleClass(icons.header, isPanelSelected).toggleClass(icons.activeHeader, !isPanelSelected);
			}

			// Toggle the panel's content
			currContent.toggleClass('accordion-content-active', !isPanelSelected);
			if (isPanelSelected) {
				currContent.slideUp(function() {
					$target.trigger('accordionactivate', ui);
				});
			} else {
				currContent.slideDown(function() {
					$target.trigger('accordionactivate', ui);
				});
			}

			return false; // Cancels the default action
		},
		icons: {
			"header": "toggle",
			"activeHeader": "toggle"
		}
	};
	var options = $.extend({}, defaultOptions, opts);

	if($target.length > 0) {
		$target.accordion(options);
	}
}

/*======================================================================================================
* function undoAccordion
*
*  will destroy an accordion using jQuery UI
*
* returns: null
* parameters:
*  target[]    (string)(jQuery selector)    Selector of the div to be accordionized.
*  opts{}      (object)                     Options to pass to jQuery UI's accordion function.
*
*====================================================================================================*/
export function undoAccordion(target) {
	var $target = $(target);
	if($target.length > 0) {
		/* destroy the accordion if it's already been initialized */
		$(target).each(function() {
			if (typeof $(this).data("ui-accordion") !== "undefined") {
				$(this).accordion("destroy");
			}
		});
	}
}

/*======================================================================================================
* function undoAccordion
*
*  will generate all possible accordions on the page
*
* returns: null
* parameters: null
*
*====================================================================================================*/
export function makeAllAccordions() {

	// we need to dynamically find what header is the first header in the article and assume that this header
	// is the primary heading used (h2 or h3).

	// TODO: reverting variables used by invalid 'header' below
	//var firstHeader = $( ".accordion" ).find( "h2, h3" ).get(0);
	//var headingTag =  firstHeader ? firstHeader.tagName : null;

	var targets = {
		//'selector' : 'header'
		// TODO: this is an overly complicated and probably invalid selector for accordion headers and is breaking functionality. Reverting to previous commit
		//'.accordion' : headingTag + ':not([data-display-excludedevice~="mobile"] ' + headingTag + '):not([class~=callout-box] ' + headingTag + ')',
		'.accordion' : 'h2:not([data-display-excludedevice~="mobile"] h2)',
		'#nvcgRelatedResourcesArea' : 'h6',
		'#cgvCitationSl' : 'h6',
		'.cthp-content' : 'h2'
	};
	//var targetsSelector = Object.keys(targets).join(', ');
	var targetsBuiltAccordion = [],
			targetsHeader = [],
			accordion;

	for(var target in targets) {
		if(targets.hasOwnProperty(target)) {
			targetsBuiltAccordion.push(target + '.ui-accordion');
			targetsHeader.push(target + ' ' + targets[target]);
		}
	}
	var targetsBuiltAccordionSelector = targetsBuiltAccordion.join(', ');
	var targetsHeaderSelector = targetsHeader.join(', ');

	function accordionize() {
		/* determine window width */
		var width = window.innerWidth || $(window).width(),
			accordion;

		// catch Safari desktop issue where an external mouse will trigger scrollbars
		if(/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
			if(window.innerWidth === $(window).width() + 15) {
				width = $(window).width();
			}
		}


		/* If the width is less than or equal to 640px (small screens)
			* AND if the accordion(s) isn't (aren't) already built */
		if (width <= config.breakpoints.medium && $(targetsBuiltAccordionSelector).length === 0 || ($( ".accordion" ).hasClass( "desktop" )) && $(targetsBuiltAccordionSelector).length === 0 ) {
			// verify that the accordion will build correctly
			$(targetsHeaderSelector).each(function() {
				var $this = $(this);
				var $next = $this.nextAll();
				if(($next.length > 0 || $this.next().is('ul, ol')) && !$next.is(".clearfix")) {
					$this.nextUntil($(targetsHeaderSelector)).wrapAll('<div class="clearfix"></div>');
				}
			});

			for(accordion in targets) {
				if(targets.hasOwnProperty(accordion)) {
					doAccordion(accordion, {'header': targets[accordion]});
				}
			}

			// after all accordions have been built, add appropriate odd/even classes to the accordion headers
			$('.ui-accordion-header').each(function(i){
				if(i % 2 === 0) {
					$(this).addClass("odd");
				} else {
					$(this).addClass("even");
				}
			});

			/* else, the window must be large */
		} else if(width > config.breakpoints.medium && !($( ".accordion" ).hasClass( "desktop" ))) {
			for(accordion in targets) {
				if(targets.hasOwnProperty(accordion)) {
					undoAccordion(accordion, {'header': targets[accordion]});
				}
			}
		}
	}

	$(window).on('resize', function() {
		accordionize();
	});

	accordionize();
}
