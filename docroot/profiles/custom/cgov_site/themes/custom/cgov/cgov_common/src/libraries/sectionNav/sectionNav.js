import $ from 'jquery';
import {
    lang as text
} from 'Core/libraries/nciConfig/NCI.config';

const lang = $('html').attr('lang') || 'en'; // set the language

const $sectionMenu = $(".section-nav");
const $sectionMenuChildren = $('.section-nav .has-children > div').not('.level-0 > div');


const initialize = () => {
    if ($sectionMenu.length > 0) {
        // make the button to open the section nav

        var button = createSectionMenuButton();
        // button.insertAfter('.fixedtotop-spacer');
        button.insertBefore('#nvcgSlSectionNav');

        // add margin to prevent the button from overlaying the page header
        $('.contentzone').addClass('has-section-nav');


        // add +/- buttons to section nav
        //toggle.createFor($sectionMenuChildren.not('.level-0 > div')).on('click', toggle.clickSection);

        var button = createSectionToggleButton();

        $sectionMenuChildren.append(button);

        // expand all children of the current page or contains-current
        $sectionMenu.find("div.current-page > .toggle, .contains-current > div > .toggle")
            .attr("aria-expanded", "true")
            .children('span')
            .text(text.Section_Menu[lang]);


        // enable clicking outside the section-menu to close
        var $overlay = $('<div id="overlay" style="display:none"></div>').click(toggleMenu);

        // append overlay div to content area for grey page overlay
        $('#content').append($overlay);

        $(window).on('resize', resizeHandler);
    }
};

const createSectionMenuButton = () => {
    return $('<a>')
        .attr('id', 'section-menu-button')
        .attr('href', '#')
        .text(text.Section_Menu[lang])
        .on('click', toggleMenu);
};

const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation(); //stopPropagation is needed for the scrollToggle effect to work in Firefox. No idea why.

    $("#overlay").fadeIn(200);

    $sectionMenu.slideToggle({
        duration: 200,
        start: function() {
            if ($sectionMenu.is('.open')) {
                // remove grey overlay div when slideToggle effect starts
                $("#overlay").fadeOut(200);
            }
        },
        complete: function () {
            var isVisible = $sectionMenu.is(':visible');
            //remove open class from button
            $("#section-menu-button").toggleClass('open', isVisible);
            $sectionMenu.toggleClass('open', isVisible);
        }
    });

}

const createSectionToggleButton = () => {
    return $('<button>').addClass('toggle')
        .attr({
            'aria-expanded': 'false',
            'type': 'button'
        }).click(toggleSection)
        .append(
            $('<span>').addClass('hidden').text(text.Expand[lang])
        );
};

const toggleSection = (e) => {

    var $this = $(e.target),
        li = $this.closest(".has-children"), // parent LI of the clicked button
        ul = li.children("ul"), // UL menu item we are hiding / showing
        lvl = 0;

    if (li.hasClass("lvl-1") || li.hasClass("level-1")) {
        lvl = 2;
    }
    if (li.hasClass("lvl-2") || li.hasClass("level-2")) {
        lvl = 3;
    }

    if ($this.attr('aria-expanded') == 'true') { // CLOSING
        $this
            .attr('aria-expanded', 'false').children('span').text(text.Expand[lang])
            .parent().find('[aria-expanded=true]')
            .attr('aria-expanded', 'false').children('span').text(text.Expand[lang]);
        ul.slideUp("slow");
    } else { // EXPANDING
        // collapse all the expanded siblings
        var siblings = li.siblings(".has-children");
        var sib_btns = siblings.children("div:first-of-type").find("button[aria-expanded='true']");
        var sib_uls = siblings.children("ul");

        // close any open siblings and their children
        sib_btns.attr('aria-expanded', 'false').children('span').text(text.Expand[lang]);
        sib_uls.slideUp("slow");

        // expand the one we clicked
        $this.attr('aria-expanded', 'true').children('span').text(text.Collapse[lang]);

        // if(windowWidth <= 1024) {
        //     sib_uls.slideUp('slow', Function.prototype);
        // } else {
        //     sib_uls.not('.section-nav .contains-current > ul').slideUp('slow', Function.prototype);
        //     sib_uls.filter('.section-nav .contains-current > ul').css('display', 'none');
        // }

        ul.slideDown("slow");
    }

}

const resizeHandler = () => {

    if (window.matchMedia("(min-width: 1025px)").matches) { //setting min-width: 1025px removes the blue bar (which defaults to open on the section menu at 1024px
        if ($sectionMenu.is(':hidden')) {
            $sectionMenu.show();
        }
    } else {
        if (!$sectionMenu.hasClass("open")) {
            $sectionMenu.hide();
        }
    }
}


export default initialize;
