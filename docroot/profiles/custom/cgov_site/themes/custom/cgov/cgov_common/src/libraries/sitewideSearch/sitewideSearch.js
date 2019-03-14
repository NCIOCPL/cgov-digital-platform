/*** BEGIN Site-Wide Search
   * This initializes jQuery UI Autocomplete on the site-wide search widget.
***/
import $ from 'jquery';
import * as NCIAutocomplete from 'Core/libraries/autocomplete/autocomplete';
import * as config from 'Core/libraries/nciConfig/NCI.config';

function _initialize() {
    require('jquery-ui');

    var language = "English";
    if ($('html').attr("lang") === "es") {
        language = "Spanish";
    }

    var $keywordElem = $('#swKeyword');
    if ($keywordElem.length === 0) {
        return;
    }
    var svcUrl = "/AutoSuggestSearch.svc/SearchJSON/" + language;


    var setAutocompleteOptions = function(element) {
        var windowWidth = window.innerWidth || $(window).width(),
            position,
            resizeMenu;

        if(windowWidth <= config.breakpoints.large) {
            // if mobile, make the autocomplete list full-width
            position = {
                my: "left top",
                at: "left bottom",
                of: "#nvcgSlMainNav"
            };

            resizeMenu = function() {
                this.menu.element.outerWidth("100%");
            };
        } else {
            // if desktop, make the autocomplete list work as default
            position = $.ui.autocomplete.prototype.options.position;
            resizeMenu = $.ui.autocomplete.prototype._resizeMenu;
        }

        element.autocomplete('option', 'position', position)
            .autocomplete('option','classes',{"ui-autocomplete":"sitewide-search-menu"})
            .data('ui-autocomplete')._resizeMenu = resizeMenu;
    };

    NCIAutocomplete.doAutocomplete($keywordElem, svcUrl, false, "term");
    setAutocompleteOptions($keywordElem);

    $(window).on('resize.NCI.search', function() {
        setAutocompleteOptions($keywordElem);

        $keywordElem.autocomplete('close');
    });

    initialized = true;
}

let initialized = false;
export default function() {
    if(initialized){
        return;
    }

    initialized = true;
    _initialize();
}
/*** END Site-Wide Search ***/
