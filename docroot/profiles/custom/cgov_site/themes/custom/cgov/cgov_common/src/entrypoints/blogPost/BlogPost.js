import "./BlogPost.scss";
import $ from 'jquery';
import { doAccordion } from 'Core/libraries/accordion/accordion';

const initializeAccordions = () => {
	// Make accordions work
	var $target = $("#blog-archive-accordion");
	doAccordion($target, {
		header: "h3",
		//Override the beforeActivate just to add Analytics tracking for blog archive accordion
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
			if (icons.header !== icons.activeHeader) {
				currHeader.children('.ui-icon').toggleClass(icons.header, isPanelSelected).toggleClass(icons.activeHeader, !isPanelSelected);
			}

			// Toggle the panel's content
			currContent.toggleClass('accordion-content-active', !isPanelSelected);
			if (isPanelSelected) {
				currContent.slideUp(function () {
					$target.trigger('accordionactivate', ui);
				});
			} else {
				currContent.slideDown(function () {
					$target.trigger('accordionactivate', ui);
				});
			}

			return false; // Cancels the default action
		}
	});

	doAccordion($('#blog-archive-accordion-year'), {
		header: "h4"
	});

	// This little blurb is searching for the parent accordion elements of the currently selected archive link and expanding the 
	// accordion to that element. This keeps the accordion collapsed on the elements not currently being viewed.
	var selectedArchiveLink = $('#blog-archive-accordion').find("a[href='" + location.pathname + location.search + "']").parent();
	if (selectedArchiveLink.length > 0) {
		selectedArchiveLink.addClass("current-archive-link");
		var indexOfLink = selectedArchiveLink.parent().prev().index() / 2;
		$('#blog-archive-accordion-year').accordion('option', 'active', indexOfLink);
		$('#blog-archive-accordion').accordion('option', 'active', 0);
	}

	$('.right-rail').find("a[href='" + location.pathname + location.search + "']").closest('li').addClass("current-categories-link");

}

const onDOMContentLoaded = () => {
	initializeAccordions();
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
