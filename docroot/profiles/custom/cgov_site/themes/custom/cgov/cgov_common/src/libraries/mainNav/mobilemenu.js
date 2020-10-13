// phpcs:disable
import $ from "jquery";
import "jquery-touchswipe";
import { lang as textTrans } from "Core/libraries/nciConfig/NCI.config";

const lang = $("html").attr("lang") || "en"; // set the language

const movingClass = "nav-moving";
const openClass = "nav-open";

const $mega = $("#mega-nav");
/* visible only on mobile, this is the menu bar itself, with hamburger & search buttons */
const $mobile = $("#mega-nav > .nav-menu");
const $openPanelBtn = $(".open-panel");
/* Mega Nav is the huge RawHTML content block on desktop, but becomes the menu tree on mobile */
const $megaChildren = $("#mega-nav .has-children > div");

let movingTimeout = setTimeout(function() {});

const initialize = () => {
  $openPanelBtn.click(toggleMobileMenu);

  // wire up the "close button" (anything that's outside the mobile menu)
  $("#content, header, footer, .headroom-area").on("click", close);

  // wire up the scroll event for the mobile menu positioning
  $(window).on("resize", resizeHandler);

  // add css landmarks for current pages and sections
  markCurrent();

  // insert the +/- buttons into the menu and wire up +/- button click events
  var button = createSectionToggleButton();
  $megaChildren.append(button);

  // expand all children of the current page or contains-current
  $mega
    .find(".current-page, .contains-current")
    .find(" > div > .toggle")
    .attr("aria-expanded", "true")
    .children("span")
    .text(textTrans.Collapse[lang])
    .end()
    .end()
    .find(" > .mobile-item")
    .show();

  // TODO: fix this equalHeights hack with flexbox layout
  // old equal heights implementation
  var borderedItems = $mega.find("[class*=border-container]");
  if (borderedItems.length > 0) {
    borderedItems.each(function(i) {
      var heights = [],
        $el = $(this),
        siblings = $el.siblings();
      siblings.each(function(j) {
        heights.push($(this).outerHeight(true));
      });
      heights.push($el.outerHeight(true));
      $el.height(Math.max.apply(null, heights));
    });
  }
};

const createSectionToggleButton = () => {
  return $("<button>")
    .addClass("toggle")
    .attr({
      "aria-expanded": "false",
      type: "button"
    })
    .click(toggleSection)
    .append(
      $("<span>")
        .addClass("show-for-sr")
        .text(textTrans.Expand[lang])
    );
};

const toggleSection = e => {
  var $this = $(e.target);
  var li = $this.closest(".has-children"); // parent LI of the clicked button
  var ul = li.children(".mobile-item"); // UL menu item we are hiding / showing

  if ($this.attr("aria-expanded") == "true") {
    // CLOSING
    // swap button
    $this
      .attr("aria-expanded", "false")
      .children("span")
      .text(textTrans.Expand[lang]);

    ul.slideUp("slow");
  } else {
    // EXPANDING
    // collapse all the expanded siblings
    var siblings = li.siblings(".has-children");
    var sib_btns = siblings.children(".nav-item-title").children("button");
    var sib_uls = siblings.children(".mobile-item");

    // close any open siblings and their children
    sib_btns
      .attr("aria-expanded", "false")
      .children("span")
      .text(textTrans.Expand[lang]);
    sib_uls.slideUp("slow");

    // expand the one we clicked
    $this
      .attr("aria-expanded", "true")
      .children("span")
      .text(textTrans.Collapse[lang]);

    ul.slideDown("slow");
  }
};

const isOpen = () => {
  return $("html").hasClass(openClass);
};

const open = () => {
  if (!isOpen()) {
    clearTimeout(movingTimeout);
    $mobile.attr("aria-hidden", "false");
    $("html")
      .addClass(movingClass)
      .addClass(openClass);

    $mobile.find(":tabbable:first").focus(); // focus the first focusable item in the menu

    // move the mobile menu down if the header is visible. Top position should match the fixedtotop element
    $mega.offset({
      top: $(".fixedtotop").offset().top
    });
    // since the mobile menu is fixed and has a height of 100%, height will need to be adjusted when pieces of the header are visible,
    // otherwise menu items at the bootom are clipped
    $mega.css(
      "height",
      "calc(100% - " +
        document.querySelector(".fixedtotop").getBoundingClientRect().top +
        "px)"
    );

    $(".fixedtotop.scroll-to-fixed-fixed").css("left", "80%");
    movingTimeout = setTimeout(function() {
      $("html").removeClass(movingClass);
    }, 500);

    // Enable swiping to close
    $("#page").swipe({
      swipeLeft: function(
        event,
        direction,
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        close();
      },
      threshold: 10, // default is 75 (for 75px)
      fallbackToMouseEvents: false
    });

    // set tabindex=-1 to items that should be removed from the tab order
    $(".mobile-menu-bar")
      .children()
      .not($openPanelBtn)
      .each(function(i, el) {
        var $el = $(el);
        $el.data("NCI-search-originaltabindex", $el.attr("tabindex") || null);
        $el.prop("tabindex", -1);
      });

    // Enable tabbing out to close
    $mega.on("keydown.NCI.Nav", function(event) {
      keyDownHandler(event);
    });
  }
};

const close = () => {
  if (isOpen()) {
    clearTimeout(movingTimeout);
    // Disable focusing out to close, before changing the focus
    $mega.off("keydown.NCI.Nav");

    $mobile.attr("aria-hidden", "true");
    $("html")
      .addClass(movingClass)
      .removeClass(openClass);

    // set tabindex back to what it was before opening
    $(".mobile-menu-bar")
      .children()
      .not($openPanelBtn)
      .each(function(i, el) {
        var $el = $(el);
        $el.attr("tabindex", $el.data("NCI-search-originaltabindex"));
      });

    // focus the menu button
    $openPanelBtn.focus();
    $(".fixedtotop.scroll-to-fixed-fixed").css("left", "0px");

    // We do a timeout here, because we have no way of knowing when
    // the CSS animation of the menu is done. We have to remove the
    // style in case the browser is made to be dekstop width, at which
    // point the applied style would affect the mega menu display
    movingTimeout = setTimeout(function() {
      $("html").removeClass(movingClass);
      $mega.removeAttr("style");
    }, 500);

    // Disable swiping to close
    $("#page").swipe("destroy");
  }
};

const keyDownHandler = event => {
  if (
    event.keyCode === $.ui.keyCode.ESCAPE ||
    (event.keyCode === $.ui.keyCode.TAB && // if the user pressed the ESC or TAB key
      (($mega.find(":tabbable:first").is(event.target) && event.shiftKey) || // if the user pressed SHIFT-TAB on the first tabbable item
        ($mega.find(":tabbable:last").is(event.target) && !event.shiftKey))) // if the user press TAB on the last tabbable item
  ) {
    event.preventDefault();
    close();
  }
};

const toggleMobileMenu = () => {
  if (isOpen()) {
    close();
  } else {
    open();
  }
};

const resizeHandler = () => {
  // remove mobile menu styles and openClass when screen becomes larger than 1024
  if (isOpen() && window.matchMedia("(min-width: 1024px)").matches) {
    $mega.removeAttr("style");
    $("html").removeClass(openClass);
  }
};

const slugifyUrl = (url) => {
  // It used to be that some browsers remove the preceeding slash from the URL
  // in the DOM.
  const normalizedUrl = url.startsWith('/') ? url.toLowerCase() : ('/' + url.toLowerCase());
  return normalizedUrl.split('/');
}

const markCurrent = () => {

  // retrieve the megamenu ul
  const MMenu = document.querySelector("#mega-nav .nav-menu");
  const activeLinkSlugs = slugifyUrl(location.pathname); // chop up the pathname
  const activeLinkDepth = activeLinkSlugs.length - 1; // account for empty first item

  // @list ul of nav-items
  // @linkDepth current search level
  const searchTree = (list, linkDepth) => {
    const nodeArray = Array.from(list.querySelectorAll(`.lvl-${linkDepth}`));
    for (let i = 0; i < nodeArray.length; i++) {
      const node = nodeArray[i];
      const nodeLinkSlugs = slugifyUrl(
        node
          .querySelector(".nav-item-title > a")
          .getAttribute("href")
      );

      // The node for /about-cancer/treatment/foo cannot possibly be
      // current or active for /about-cancer/treatment current URL. So
      // move along.
      if (nodeLinkSlugs.length > activeLinkSlugs.length) {
        continue;
      }

      // This is the same page.
      if (activeLinkSlugs.length === nodeLinkSlugs.length) {
        if (activeLinkSlugs.join('/') === nodeLinkSlugs.join('/')) {
          node.classList.add("current-page");
          return;
        } else {
          // Same number of items, but not a match, no need to continue
          // cause it is impossible for there to be a child.
          continue;
        }
      }

      // So this *may* be the case where the path is open. So if the
      // number of slugs for the active
      if (nodeLinkSlugs.join('/') === activeLinkSlugs.slice(0,nodeLinkSlugs.length).join('/')) {
        // this is the section, add '.contains-current'
        node.classList.add("contains-current");
        if (activeLinkDepth > linkDepth && node.querySelector("ul")) {
          searchTree(node.querySelector("ul"), linkDepth + 1);
        }
        // searchTree flagged all the child items, so we are done and should
        // stop looping.
        return;
      }
    }
    // NOTE: You may also get to this point with no matches from a recursive
    // searchTree call when the active URL is deeper than the max depth of
    // the menu. This is ok.
  };

  searchTree(MMenu, 1);

};

export { $openPanelBtn, toggleMobileMenu };
export default initialize;
