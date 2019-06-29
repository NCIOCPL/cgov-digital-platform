
import $ from 'jquery';

function _initialize() {
  // ``:not([data-drupal-selector="edit-view-mode"])` has been added to prevent our in house overrides
  // from mucking with Drupal generated page elements in content preview mode.
	$('select:not([multiple]):not(.no-auto-jqueryui):not([data-drupal-selector="edit-view-mode"])').each(function () {
		var $this = $(this);

		$this.selectmenu({
			change: function (event, ui) {
				// This calls the parent change event, e.g. so that .NET dropdowns can autopostback
				ui.item.element.change();
			},
			width: $this.hasClass('fullwidth') ? '100%' : null
		}).selectmenu('menuWidget').addClass('scrollable-y');
	});
}

let _initialized = false;
export default function() {
	if (!_initialized) {
		_initialized = true;
		_initialize();
	}
}
