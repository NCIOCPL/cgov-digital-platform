import $ from 'jquery';
import * as config from 'Core/libraries/nciConfig/NCI.config';

const timerLength = 1000;

function _initialize() {

    $('a[href^="#cit"], a[href^="#r"]')
        .filter(function () {
            // filter to verify ONLY citations are selected, otherwise this will match things like a[href="references"]
            return /^#r\d+$|^#cit\/section_\d+.\d+$/.test(this.getAttribute('href'));
        })
        .each(function () {
            var tooltipNode, hideTimer, showTimer, checkFlip = false;

            function findRef(h) {
                h = document.getElementById(
                    h.getAttribute('href')
                        .replace(/^#cit\//, '#')
                        .replace(/^#/, '')
                );
                h = h && h.nodeName == "LI" && h;

                return h;
            }

            function show() {
                if (!tooltipNode.parentNode || tooltipNode.parentNode.nodeType === 11) {
                    document.body.appendChild(tooltipNode);
                    checkFlip = true;
                }
                $(tooltipNode).stop().animate({
                    opacity: 1
                }, 100);
                clearTimeout(hideTimer);
            }

            function hide() {
                if (tooltipNode && tooltipNode.parentNode == document.body) {
                    hideTimer = setTimeout(function () {
                        $(tooltipNode).animate({
                            opacity: 0
                        }, 100, function () {
                            document.body.removeChild(tooltipNode);
                        });
                    }, 100);
                }
                //$(findRef(refLink)).removeClass('RTTarget');
            }

            $(this).on('mouseenter.NCI.tooltip', function (e) {
                var that = this;

                hideTimer && clearTimeout(hideTimer);
                showTimer && clearTimeout(showTimer);

                showTimer = setTimeout(hoverHandler, timerLength);

                function hoverHandler() {
                    var h = findRef(that);
                    if (!h) {
                        return;
                    }

                    // Don't show on smartphone
                    var width = window.innerWidth || $(window).width();
                    if (width <= config.breakpoints.medium) {
                        return;
                    }

                    /*if ((window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) + $(window).height() > $(h).offset().top + h.offsetHeight) {
                        $(h).addClass('RTTarget');
                        //return;
                        }*/

                    if (!tooltipNode) {
                        tooltipNode = document.createElement('ul');
                        tooltipNode.className = "referencetooltip";
                        var c = tooltipNode.appendChild(h.cloneNode(true));
                        tooltipNode.appendChild(document.createElement('li'));
                        $(tooltipNode).on('mouseenter.NCI.tooltip', show).on('mouseleave.NCI.tooltip', hide);
                    }
                    show(tooltipNode);
                    var offset = $(that).offset(),
                        offsetHeight = tooltipNode.offsetHeight;
                    $(tooltipNode).css({
                        top: offset.top - offsetHeight,
                        left: offset.left - 7
                    });
                    if (tooltipNode.offsetHeight > offsetHeight) { // is it squished against the right side of the page?
                        $(tooltipNode).css({
                            left: 'auto',
                            right: 0
                        });
                        tooltipNode.lastChild.style.marginLeft = (offset.left - tooltipNode.offsetLeft) + "px";
                    }
                    if (checkFlip) {
                        if (offset.top < tooltipNode.offsetHeight + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) + $(".fixedtotop").outerHeight()) { // is part of it above the top of the screen?
                            $(tooltipNode).addClass("RTflipped").css({
                                top: offset.top + 12
                            });
                        } else if (tooltipNode.className === "referencetooltip RTflipped") { // cancel previous
                            $(tooltipNode).removeClass("RTflipped");
                        }
                        checkFlip = false;
                    }
                }
            }).on('mouseleave.NCI.tooltip', function () {
                clearTimeout(showTimer);
                hide(tooltipNode);
            }).on('click.NCI.tooltip', function () {
                var $this = $(this);
                $this.closest('figure.table.ui-dialog-content').dialog('close');
                $this.trigger('mouseleave.NCI.tooltip');
            });
        });
}

let initialized = false;
export default function() {
    if (initialized) {
        return;
    }

    initialized = true;
    _initialize();
}
