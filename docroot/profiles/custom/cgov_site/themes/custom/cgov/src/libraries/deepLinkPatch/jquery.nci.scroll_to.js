// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery','Core/libraries/nciConfig/NCI.config'], factory);
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
            factory(jQuery,require('Core/libraries/nciConfig/NCI.config'));
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery,NCI.config);
    }
}(function ($,config) {
    // Add to NCI namespace
    if (!$.NCI) {
        $.NCI = {};
    }

    // Define new plugin constructor
    $.NCI.scroll_to = function ( el, options ) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // plugin initializer
        base.scroll = function () {
            // extend options
            base.options = $.extend({},$.NCI.scroll_to.defaultOptions, options);


            /* PLUGIN LOGIC GOES HERE */
            var anchor = base.options.anchor || base.$el.attr("href"), // scroll to target can be an option or an href attribute
                $anchor = $(anchor),
                headerHeight = $(base.options.header).outerHeight() || 0,
                width = window.innerWidth || $(window).width(),
                //isSection = base.options.isSection || anchor.match(/^#section\//i),
                scrollY = window.scrollY || window.pageYOffset,
                fuzz = base.options.fuzz,
                anchorTop = ($anchor.length > 0) ? $anchor.offset().top : 0,
                hasPreviousState = (base.options.event === "load") && ((scrollY < anchorTop - headerHeight - fuzz) || (scrollY > anchorTop + fuzz/2)) && (scrollY !== 0),
                scrollTo = 0
            ;

            // if the anchor is a PDQ section and we're >=desktop
            if(hasPreviousState) {
                console.log("restoring previous scroll state");
                // unfreeze the header set in deepLinkPatch.js
                setTimeout(function() {
                    $('.headroom-area').removeClass('frozen');
                },150);
                // returning true does not prevent standard anchors from working on page load
                return;
            } else if(width > config.breakpoints.large && anchor == '#all') {
                scrollTo = $('#main h1:first').offset().top - headerHeight;
                // willFreeze = false;
            } else {
                scrollTo = anchorTop - headerHeight;
            }

            // freeze headroom
            $('.headroom-area').addClass('frozen');

            // shift focus
            $('[tabindex="1"]').focus();

            // one time scroll event, will unbind itself after scroll
            $(window).one('scroll.scrollTo',function(){
                //Headroom is on a 100ms delay on load, setting this timeout to more than that
                setTimeout(function() {
                    // scrolling again to account for .fixedtotop-spacer spacer toggle triggered by headroom
                    window.scrollTo(0, scrollTo);
                    //unfreeze headroom
                    $('.headroom-area').removeClass('frozen');
                }, 150);
            });

            //scrolling will trigger headroom toggle scroll event - changing the scroll position
            window.scrollTo(0, scrollTo);

        };

        // Trigger the scroll
        base.scroll();
    };

    // plugin defaults
    $.NCI.scroll_to.defaultOptions = {
        anchor: null,
        event: 'click',
        header: '.fixedtotop',
        fuzz: 45
    };

    // Add plugin to jQuery namespace
    $.fn.NCI_scroll_to = function( options ) {
        return this.each(function () {
            (new $.NCI.scroll_to(this,options));
        });
    };
}));
