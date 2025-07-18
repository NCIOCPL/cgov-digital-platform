import './blogs.scss';
import './blogs-legacy.scss';

import * as $ from 'jquery';
import { doAccordion } from 'Core/libraries/accordion/accordion';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';
import cgdpCitationInit from '../../lib/components/cgdp-article-footer-citation';

// Cheating here and just copying in the jqueryui type since TS is not pulling it in.
interface AccordionUIParams {
	newHeader: JQuery;
	oldHeader: JQuery;
	newPanel: JQuery;
	oldPanel: JQuery;
}

const initializeAccordions = () => {
	// Make accordions work
	const $target = $('#blog-archive-accordion');
	doAccordion($target, {
		header: 'h2',
		//Override the beforeActivate just to add Analytics tracking for blog archive accordion
		beforeActivate: function (event: unknown, ui: AccordionUIParams) {
			const icons = $(this).accordion('option', 'icons');
			// The accordion believes a panel is being opened
			let currHeader;
			if (ui.newHeader[0]) {
				currHeader = ui.newHeader;
				// The accordion believes a panel is being closed
			} else {
				currHeader = ui.oldHeader;
			}
			const currContent = currHeader.next('.ui-accordion-content');
			// Since we've changed the default behavior, this detects the actual status
			const isPanelSelected = currHeader.attr('aria-selected') == 'true';

			// Toggle the panel's header
			currHeader
				.toggleClass('ui-corner-all', isPanelSelected)
				.toggleClass(
					'accordion-header-active ui-state-active ui-corner-top',
					!isPanelSelected
				)
				.attr('aria-selected', (!isPanelSelected).toString())
				.attr('aria-expanded', (!isPanelSelected).toString());

			// Toggle the panel's icon if the active and inactive icons are different
			if (icons.header !== icons.activeHeader) {
				currHeader
					.children('.ui-icon')
					.toggleClass(icons.header, isPanelSelected)
					.toggleClass(icons.activeHeader, !isPanelSelected);
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
		},
	});

	doAccordion($('#blog-archive-accordion-year'), {
		header: 'h3',
	});

	// This little blurb is searching for the parent accordion elements of the currently selected archive link and expanding the
	// accordion to that element. This keeps the accordion collapsed on the elements not currently being viewed.
	const selectedArchiveLink = $('#blog-archive-accordion')
		.find("a[href='" + location.pathname + location.search + "']")
		.parent();
	if (selectedArchiveLink.length > 0) {
		selectedArchiveLink.addClass('current-archive-link');
		const indexOfLink = selectedArchiveLink.parent().prev().index() / 2;
		$('#blog-archive-accordion-year').accordion(
			'option',
			'active',
			indexOfLink
		);
		$('#blog-archive-accordion').accordion('option', 'active', 0);
	}

	$('.right-rail')
		.find("a[href='" + location.pathname + location.search + "']")
		.closest('li')
		.addClass('current-categories-link');
};

const onDOMContentLoaded = () => {
	initializeAccordions();
	cgdpRelatedResourcesInit();
	cgdpCitationInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
