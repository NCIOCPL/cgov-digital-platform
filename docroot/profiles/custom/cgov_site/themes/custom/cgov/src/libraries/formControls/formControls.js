
import $ from 'jquery';

function _initialize() {			
	$('select:not([multiple]):not(.no-auto-jqueryui)').each(function () {
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
