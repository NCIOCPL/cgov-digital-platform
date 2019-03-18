// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    // Add to NCI namespace
    if (!$.NCI) {
        $.NCI = {};
    }

    // Define new plugin constructor
    $.NCI.prevent_enter = function ( el, options ) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // plugin initializer
        base.init = function () {
            // extend options
            base.options = $.extend({},$.NCI.prevent_enter.defaultOptions, options);

            /* PLUGIN LOGIC GOES HERE */
            if(!base.$el.data( "NCI.prevent_enter")){

                // save initialization
                base.$el.data( "NCI.prevent_enter" , base );

                base.$el.submit(function(e){
                    if(!$( document.activeElement ).is('[data-prevent-enter="false"]')) {
                        event.preventDefault();
                    }
                });
            }
        };

        // Run initializer
        base.init();
    };

    // plugin defaults
    $.NCI.prevent_enter.defaultOptions = {
        option: "setting"
    };

    // Add plugin to jQuery namespace
    $.fn.NCI_prevent_enter = function( options ) {
        return this.each(function () {
            (new $.NCI.prevent_enter(this,options));
        });
    };
}));