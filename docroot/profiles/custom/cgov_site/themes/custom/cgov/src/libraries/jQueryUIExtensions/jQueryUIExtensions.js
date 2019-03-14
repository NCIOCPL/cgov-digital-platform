import $ from 'jquery';

// Patch to restore ui-focus-state to menu items
$.widget( "ui.menu", $.ui.menu, {
    focus: function(event,ui){
        $('.ui-state-focus').removeClass('ui-state-focus');
        $(ui[0]).addClass('ui-state-focus');
        return this._super(null, arguments[1]);
    }
});

$.widget( "ui.accordion", $.ui.accordion, {
    destroy: function(){
        //jquery-ui destroy method does not remove ui-state-active from headers for some reason
        for (var i = 0; i < this.element.length; i++) {
            $(this.element[i]).find('.ui-accordion-header').removeClass('ui-state-active');
        }
        return this._super()
    }
});

$.widget( "ui.autocomplete", $.ui.autocomplete, {
    _renderItem: function(ul,item){
        var lterm = this.term.replace(/[-[\]{}()*+?.,\^$|#\s]/g, '\$&');

        var regexBold = new RegExp('(' + lterm + ')', 'i');
        var word = (item.value || item.term).replace(regexBold, "<strong>$&</strong>");

        return $("<li>")
            .data('data-value', item.value)
            .append(word)
            .appendTo(ul);
    }
});

$.ui.selectmenu.prototype._buttonEvents.keydown = function (event) {
    var preventDefault = true;
    switch (event.keyCode) {
        case $.ui.keyCode.TAB:
        case $.ui.keyCode.ESCAPE:
            this.close(event);
            preventDefault = false;
            break;
        case $.ui.keyCode.ENTER:
            if (this.isOpen) {
                this._selectFocusedItem(event);
            }
            break;
        case $.ui.keyCode.UP:
            if (event.altKey) {
                this._toggle(event);
            } else {
                this._move("prev", event);
            }
            break;
        case $.ui.keyCode.DOWN:
            if (event.altKey) {
                this._toggle(event);
            } else {
                this._move("next", event);
            }
            break;
        case $.ui.keyCode.SPACE:
            if (this.isOpen) {
                this.menu.trigger(event);
            } else {
                this._toggle(event);
            }
            break;
        case $.ui.keyCode.LEFT:
            this._move("prev", event);
            break;
        case $.ui.keyCode.RIGHT:
            this._move("next", event);
            break;
        case $.ui.keyCode.HOME:
        case $.ui.keyCode.PAGE_UP:
            this._move("first", event);
            break;
        case $.ui.keyCode.END:
        case $.ui.keyCode.PAGE_DOWN:
            this._move("last", event);
            break;
        default:
            this.menu.trigger(event);
            preventDefault = false;
    }

    if (preventDefault) {
        event.preventDefault();
    }
};
$.ui.menu.prototype._keydown = function (event) {
    var match, prev, character, skip,
        preventDefault = true;

    switch (event.keyCode) {
        case $.ui.keyCode.PAGE_UP:
            this.previousPage(event);
            break;
        case $.ui.keyCode.PAGE_DOWN:
            this.nextPage(event);
            break;
        case $.ui.keyCode.HOME:
            this._move("first", "first", event);
            break;
        case $.ui.keyCode.END:
            this._move("last", "last", event);
            break;
        case $.ui.keyCode.UP:
            this.previous(event);
            break;
        case $.ui.keyCode.DOWN:
            this.next(event);
            break;
        case $.ui.keyCode.LEFT:
            this.collapse(event);
            break;
        case $.ui.keyCode.RIGHT:
            if (this.active && !this.active.is(".ui-state-disabled")) {
                this.expand(event);
            }
            break;
        case $.ui.keyCode.ESCAPE:
            this.collapse(event);
            break;
        case $.ui.keyCode.ENTER:
            this._activate(event);
            break;
        default:
            preventDefault = false;
            prev = this.previousFilter || "";
            character = String.fromCharCode(event.keyCode);
            skip = false;

            clearTimeout(this.filterTimer);

            if (character === prev) {
                skip = true;
            } else {
                character = prev + character;
            }

            match = this._filterMenuItems(character);
            match = skip && match.index(this.active.next()) !== -1 ?
                this.active.nextAll(".ui-menu-item") :
                match;

            // If no matches on the current filter, reset to the last character pressed
            // to move down the menu to the first item that starts with that character
            if (!match.length) {
                character = String.fromCharCode(event.keyCode);
                match = this._filterMenuItems(character);
            }

            if (match.length) {
                this.focus(event, match);
                this.previousFilter = character;
                this.filterTimer = this._delay(function () {
                    delete this.previousFilter;
                }, 1000);
            } else {
                delete this.previousFilter;
            }
    }

    if (preventDefault) {
        event.preventDefault();
    }
};
$.ui.selectmenu.prototype._setAria = function (item) {
    var id = this.menuItems.eq(item.index).attr("id");

    this.button.attr({
        "aria-activedescendant": id
    });
    this.menu.attr("aria-activedescendant", id);
};
// Jquery-ui selectmenu dropdowns are less than ideal when it comes to accessibility. This is a hack to try and improve their 
// behavior when it comes to screenreaders.
$.widget("ui.selectmenu", $.ui.selectmenu, {
    _drawButton: function(){
        this._super();
        // This bizarre selector is how we access the 'for' attribute of the label (on a jquery object)
        // on a reconstructed dropdown so that we can ensure it points at the original select
        // element not the the stand-in span created by selectmenu
        this.labels[0].attributes[0].value = this.labels[0].attributes[0].value.replace(/\-button$/, '')

        // We also want to add an additional aria tag pointing at the hidden select (whose id is this.ids.element)
        this.button.attr('aria-labelledby', this.ids.element);
    }
})
