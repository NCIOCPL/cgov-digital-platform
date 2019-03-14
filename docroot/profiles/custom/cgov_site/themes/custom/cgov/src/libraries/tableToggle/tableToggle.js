import $ from 'jquery';

function _initialize() {
    $('[data-toggletables-section]').each(function () {
        // dynamically apply the tablenumber data attribute, hide the caption if needed, and hide the other tables
        $(this).children('table').each(function (i) {
            // hide the captions if needed (specified by 'data-hidden-on-js' on the <caption> element)
            $(this).children('caption[data-hidden-on-js]').addClass('hidden');
            // apply the data-table-filternum attribute to ALL tables
            $(this).attr('data-toggletables-tablenumber', i);
            if (i === 0) {
                // show the tables that are first (default is already shown, but this makes it explicit)
                $(this).addClass('show');
            } else {
                // hide the tables that aren't first
                $(this).addClass('hide');
            }
        });

        // make the first filter link active
        $(this).find('dl > dd').first().addClass('active');

        // bind the filter links
        $(this).find('dl > dd').on('click', function () {
            // get jQuery object of this term
            var $this = $(this);
            // get the index of this term (0-base!)
            var index = $this.index() - 1;

            // get the parent (list of filters), to activate later
            var $filterList = $this.parent('dl');
            // get the table that's been selected, to show later
            var $selectedTable = $this.closest('[data-toggletables-section]').children('[data-toggletables-tablenumber=' + index + ']');

            // show the selected table
            $selectedTable.removeClass('hide').addClass('show');
            // hide the other tables
            $selectedTable.siblings('table').removeClass('show').addClass('hide');

            // remove the active class from the other filter terms
            $this.siblings('dd').removeClass('active');
            // add the active class to the selected filter term
            $this.addClass('active');
        });
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
