import $ from 'jquery';
import 'jquery-ui';
import { NCIAnalytics } from 'Core/libraries/analytics/nci-analytics-functions';

// Function to create an "Enlarge" button to click in order to
// display a table or image using the entire window area
// --------------------------------------------------------------

/**
 * Function for adding in large table capabilities.  This is the scrolling and enlarge button.
 *
 */
function enhanceLargeTable(fig, settings) {

    //Add wrapper to indicate table has scroll area
    fig.data('scrollWrapper').addClass('has-scroll');
    fig.data('scrollWrapper').addClass('scrollable');

    //Determine the current width.
    var curWidth = window.innerWidth || $(window).width();


    if (curWidth <= settings.thresholdForEnlarge) { //Should be no enlarge...
        //Less than the threshold for enlarging.  Remove the enlarge button if needed
        removeEnlargeButton(fig);

    } else {

        //Set the width of the table to be the same as it would be if the
        //table were expanded.  This should minimize re-flowing of content
        //and thus keep the height the same.
        // fig.data('theTable').width(calculateTableWidth(settings));

        if (!fig.data('enlargeBtn')) {

            //Add Enlarge button before scroll wrapper.
            var enlargeButton = $('<a/>', {
                'class': 'article-image-enlarge no-resize',
                'href': '#',
                'html': settings.enlargeTxt
            })
            // Create the click event on the Enlarge link
            // -------------------------------------------
            .on('click.enlarge',function(e){
                e.preventDefault();
                try {
                    NCIAnalytics.GlobalLinkTrack({sender: this, label:'table-enlarge'});
                }
                catch(err) {
                    console.log(err.message);
                }

                enlargeTable(fig, settings);
            }).insertBefore(fig.data('scrollWrapper'));

            //if there is no caption we need a spacer.
            if (!fig.data('caption')) {
                var emptyCaptionShim = $('<div/>', {
                    class: 'emptyCaptionShim',
                    html: '&nbsp;'
                }).insertBefore(enlargeButton);
            } else {
                //set the width of the caption to be smaller
                fig.data('caption').css('padding-right', enlargeButton.outerWidth());
            }

            //Set the enlarge button as data on the figure for easy retrieval
            fig.data('enlargeBtn', enlargeButton);

        }
    }
}

function getFigOrMakeOne(element) {
    var fig = false;

    if (element.parents('figure').length <= 0) {
        fig = $('<figure></figure>');
        fig.addClass("table");
        fig.attr('data-display-excludedevice', element.attr('data-display-excludedevice'));
        fig.insertBefore(element);
        element.appendTo(fig);
        //Get the caption
        var tcaption = element.find("caption");
        //If there is table caption, make that the figure caption.
        if (tcaption.length > 0) {
            var fcaption = $('<figcaption></figcaption>');
            //Add ID, base it on table id if there is one.
            var table_id = element.attr("id");
            if (table_id) {
                fcaption.attr("id", table_id + "_cap");
            } else {
                fcaption.uniqueId(); //Note jQueryUI function
            }
            //Add aria-labelledby to table
            element.attr("aria-labelledby", fcaption.attr("id"));
            //Move contents of caption to figcaption and remove old caption
            fcaption.append(tcaption.contents());
            tcaption.remove();

            //Set a reference to the caption for later use.
            fig.data("caption", fcaption);

            //Add the caption to the figure - make sure it is first.
            fig.append(fcaption);
        } else {
            element.data("caption", false);
        }
        //Add the table to the caption
        fig.append(element);
    } else {
        //Grab fig...
        fig = element.parents('figure');
    }

    return fig;

}


function enlargeTable(fig, settings) {
    //Remove drop shadow and scroller
    fig.data('scrollWrapper').removeClass('has-scroll');
    fig.data('scrollWrapper').removeClass('scrollable');

    if (!fig.data('figWrapper')) {
        //Add in a wrapper to push down the page contents
        //when enlarged.  This is mostly for PDQ references
        var figWrapper = $('<div />', {
            'class': 'enlarge-table-wrapper',
        }).insertBefore(fig);

        fig.data('figWrapper', figWrapper);
    }

    //Show is asynchronous, so we must pass a complete function at the end which will open the popup.
    //fig.data('figWrapper').show(0, function() {

    fig.dialog({
        width: calculateDialogWidth(settings),
        // height: calculateDialogHeight(fig, settings),
        draggable: false,
        resizable: false,
        modal: false,
        title: '', //No title, we are hiding it anyway...
        dialogClass: 'table-enlarged',
        position: {
            my: 'top',
            at: 'top',
            collision: 'none', //Important so it goes on top of wrapper
            of: fig.data('anchorPoint'),
            using: function(pos) {
                //Position to the top of the anchorpoint element
                $(this).css("top", pos.top);

                //Position left as window's position + left margin
                $(this).css("left", settings.dialogLRMargin);
            }
        },
        create: function (event, ui) {
            //Make the window's scrollbars go away
            //$("body").css({ overflow: 'hidden'});
            //hide enlarge button
            if (fig.data('enlargeBtn')) {
                fig.data('enlargeBtn').hide();
            }
            //add close block
            var closeBlock = $("<div/>", {
                'class': 'popup-close'
            });
            //setup close link
            var closeLink = $("<a/>", {
                'href': '#',
                'onclick': 'return false;'
            }).append($("<span/>", {
                'class': 'hidden',
                'html': settings.closeTxt
            }));
            //Setup click handler to close the dialog
            closeLink.click(function () {
                fig.dialog('close');
                return false;
            });
            closeBlock.append(closeLink);
            fig.prepend(closeBlock);
        },
        beforeClose: function (event, ui) {
            //Make the window's scrollbars come back
            //$("body").css({ overflow: 'inherit'});
            //remove close
            fig.find(".popup-close").remove();

            //		fig.data('figWrapper').hide()

            //show enlarge button
            if (fig.data('enlargeBtn')) {
                fig.data('enlargeBtn').show();
            }
        },
        open: function () {
            //$(this).scrollTop(0);

            var wrap = fig.data('figWrapper');

            /*
    if (wrap) {
                wrap.height($(this).outerHeight() + 20); //Give 20px of padding between popup and references/content
            }
        */

        },
        close: function (event, ui) {

            var wrap = fig.data('figWrapper');

            if (wrap) {
                wrap.height(1); //Give 20px of padding between popup and references/content
            }

            // This removes the dialog and puts the contents back 
            // where it got it from
            $(this).dialog('destroy');
            fig.data('scrollWrapper').addClass('has-scroll');
            fig.data('scrollWrapper').addClass('scrollable');
        }
    });
    //});

}


/**
 * Helper to remove enlarge button
 */
function removeEnlargeButton(fig) {
    var enlarge = fig.data('enlargeBtn');

    if (enlarge) {
        enlarge.remove();
        fig.data('enlargeBtn', false);

        fig.data('caption').css('padding-right', 0);
    }

    //Remove any empty caption shims
    fig.find('.emptyCaptionShim').remove();


}

function calculateDialogWidth(settings) {
    return $(window).width() - (settings.dialogLRMargin * 2);
}

function calculateDialogHeight(fig,settings) {
    return fig.height() + 14;
}

function calculateTableWidth(settings) {
    return calculateDialogWidth(settings) - (settings.dialogLRInnerPadding * 2);
}

/**
 * Initialization function for plugin
 */
$.fn.overflowEnlarge = function( options ) {

    // Adding some default settings
    var settings = $.extend({
        text: "Default Text",
        color: null,
        enlargeTxt : ($('meta[name="content-language"]').attr('content') == 'es') ? "Ampliar" : "Enlarge",
        collapseTxt : ($('meta[name="content-language"]').attr('content') == 'es') ? "Cerrar" : "Close",
        thresholdForEnlarge : 1024,
        xlThreshold: 1440, //This is when the browser goes into XL mode and the body is wider.
        dialogLRMargin : 20,
        dialogLRInnerPadding : 16
    }, options);

    // Creating the "Enlarge" link above the table or figure
    // -----------------------------------------------------------
    return this.each( function() {

        var element = $(this);

        //We want the table to be in a figure tag and for its table caption to be
        //a figcaption.  If the table is already in a figure, we do not want to do this.
        var fig = getFigOrMakeOne(element);

        var figAnchorPoint = $('<div />', {
            height: 1
        }).insertBefore(fig);

        fig.data('anchorPoint', figAnchorPoint);

        // Create the wrapper element
        var scrollWrapper = $('<div />', {
            'class': 'scrollable', // Adding 'has-scroll' here adds a 
                            // shadow border at page load even 
                    // without scrollbar
            'html': '<div />' // The inner div is needed for styling
        }).insertBefore(element);

        // Move the scrollable element inside the wrapper element
        element.appendTo(scrollWrapper.find('div'));

        //Set a reference on the figure for the table.
        fig.data('theTable',element);

        // Store a reference to the wrapper element
        fig.data('scrollWrapper', scrollWrapper);

        //There are two body widths on desktop, 1024-1339 & 1440+.  Some 
    //tables will not fit in the body area for 1024-1339, but will for 
    //1440+. Since we do a lot of table width changing to make sure 
    //text flows correctly when enlarged, we need to store the original
    //width so that if we are XL then we can remove the enlarges and such
        fig.data('tblOrigWidth', fig.data('theTable').width());

        // Check if the element is wider than its parent and thus needs to be scrollable
    // Note: This does only work for the first section because the 
    // width for hidden elements is always 0
    // We're running another trigger in showSection to redraw the 
    // Enlarge button
        if (fig.data('theTable').outerWidth() > fig.data('theTable').parent().outerWidth()) {

            //It meets our conditions, enlargify the contents
            enhanceLargeTable(fig, settings);
        }


        // When the viewport size is changed, check again if the element needs to be scrollable
        $(window).on('resize orientationchange accordionactivate pdqinpagenav', function () {
            var curWidth = window.innerWidth || $(window).width();

            //If popup is open and the curWidth < [Threshold for Enlarging], close the window
            if (fig.dialog("instance") !== undefined) { //Since we always destroy dialog, instance means exists and open

                if (curWidth <= settings.thresholdForEnlarge) {
                    //Smaller than desktop breakpoint, close window
                    fig.dialog('close');

                    //Remove Enlarge
                    removeEnlargeButton(fig);

                } else {
                    //If the window is going to be larger than the current available space,
                    //then resize the window

                    //Sizing the dialog has issues.  Basically we can increase and decrease the width of the table and dialog,
                    //but then the height becomes a problem because the figure's height is no longer fixed, but overflowed to
                    //fit the dialog.  For now it is best to just destroy the dialog and reopen.

                    //Close the dialog
                    fig.dialog('close');

                    //resize the table
                    // fig.data("theTable").width(calculateTableWidth(settings));

                    if (fig.data('theTable').outerWidth() > fig.data('theTable').parent().outerWidth()) {

                        //Re-open the dialog
                        enlargeTable(fig, settings);

                    } else {
                        //Remove Scroll Classes
                        fig.data('scrollWrapper').removeClass('has-scroll');
                        fig.data('scrollWrapper').removeClass('scrollable');

                        //Remove Enlarge
                        if (curWidth < settings.thresholdForEnlarge) {
                            removeEnlargeButton(fig);
                        }

                    }

                }
            } else {
                if (curWidth >= settings.xlThreshold) {
                    //This should only be done when we have changed the size of a table
                    //for enlarging.
                    // fig.data('theTable').width(fig.data('tblOrigWidth'));
                }

                if (fig.data('theTable').outerWidth() > fig.data('theTable').parent().outerWidth()) {
                    enhanceLargeTable(fig, settings);
                } else {
                    // We are no longer too wide for our container.

                    //Remove Scroll Classes
                    fig.data('scrollWrapper').removeClass('has-scroll');
                    fig.data('scrollWrapper').removeClass('scrollable');

                    //Remove Enlarge
                    removeEnlargeButton(fig);

                }
            }

        });

    });
};
