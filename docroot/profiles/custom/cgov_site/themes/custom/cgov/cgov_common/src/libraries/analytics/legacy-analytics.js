import $ from "jquery";
import { registerCustomEventListener } from "Core/libraries/customEventHandler";
import NCIAnalytics from "Core/libraries/analytics/atomic-analytics-functions/cgov-common/index";

/**
 * This file contains the analytics for sites still using cgov_common theme. E.g. DCEG Connect.
 */

// Utility functions
// treeText
// when clicking on an accordion button, get the accordion hierarchy and depth
// ARGS
// obj:$ collection - collection of accordion titles
function treeText(obj) {
  var str = "",
    depth = 0;
  $(obj.get().reverse()).each(function (i, el) {
    if (str == "") {
      str = $(el).find("a:first").text();
    } else {
      str += ">" + $(el).find("a:first").text();
    }
    depth++;
  });
  return { string: str, depth: depth };
}

$(document).ready(function () {
  // This is most likely junk that should not be here, but it was in the original analytics.js.
  var pageName = "D=pageName";

  // PAGE OPTIONS MODULE
  registerCustomEventListener("NCI.page_option.clicked", (target, data) => {
    const { type, args } = data;
    NCIAnalytics[type](target, ...args);
  });

  // old mega menu and mobile tracking from the header/primary nav.
  $("#mega-nav a")
    .filter(function () {
      return $(this).closest(".mobile-item").length === 0;
    })
    .on("click.analytics", function (event) {
      var $this = $(this),
        tree = [],
        treeParents = $this.parent("li").parents("li");
      tree.push($this[0]);
      if (treeParents.children("a").length > 0) {
        tree.push(treeParents.children("a")[0]);
      }
      if (treeParents.children("div").children("a").length > 0) {
        tree.push(treeParents.children("div").children("a")[0]);
      }

      NCIAnalytics.MegaMenuClick(this, tree);
    });

  var menuRevealed;
  var megaNav = $("#mega-nav");
  var mobileMenuBar = $(".mobile-menu-bar");
  megaNav
    .on("mouseenter.analytics", ".nav-item", function (e) {
      window.clearTimeout(menuRevealed);
      if (mobileMenuBar.is(":hidden")) {
        menuRevealed = window.setTimeout(function () {
          var menuText = $("#mega-nav a.open").text();
          NCIAnalytics.MegaMenuDesktopReveal(this, menuText);
        }, 1000);
      }
    })
    .on("mouseleave.analytics", ".nav-item", function (e) {
      window.clearTimeout(menuRevealed);
    })
    .on("click.analytics", "button.toggle", function () {
      var $this = $(this),
        isExpanded = $this.attr("aria-expanded") === "true",
        tree = treeText($this.parents("li")).string,
        linkText = $this.prev().text(); //linkText no longer used now that it's being captured with the tree values;
      NCIAnalytics.MegaMenuMobileAccordionClick(this, isExpanded, tree);
    })
    .on("click.analytics", ".lvl-1 a, .mobile-item a", function (e) {
      if (mobileMenuBar.is(":visible")) {
        //e.preventDefault();
        var $this = $(this),
          linkText = $this.text(),
          linkUrl = $this.attr("href"),
          root = $this.closest(".lvl-1"),
          heading = $.trim(root.children(":first").find("a").text()),
          parent = $this.closest(".lvl-2"),
          subHeading =
            parent[0] && parent.children(":first").find("a").get(0) !== this
              ? $.trim(parent.children(":first").find("a").text())
              : heading;

        //console.log("url: " + url + "\nlinkText: " + linkText  + "\nlinkUrl: " + linkUrl + "\nheading: " + heading + "\nsubHeading: " + subHeading);
        NCIAnalytics.MegaMenuMobileLinkClick(
          this,
          pageName,
          linkText,
          linkUrl,
          heading,
          subHeading
        );
      }
    });

  mobileMenuBar.on("click.analytics", ".nav-header", function () {
    var isVisible = false;
    if ($("#mega-nav > .nav-menu").attr("aria-hidden") === "false") {
      isVisible = true;
    }
    if (isVisible) {
      NCIAnalytics.MegaMenuMobileReveal(this);
    }
  });

  // This is for tracking logo clicks in the header area
  $(".nci-logo-pages").on("click.analytics", function (event) {
    NCIAnalytics.LogoClick(this);
  });

  // This is legacy feature card tracking for home/landing pages.
  // DCEG connect study news uses this.
  $(".feature-primary .feature-card").each(function (i, el) {
    $(el).on("click.analytics", "a", function (event) {
      var $this = $(this);
      var cardTitle = $this.children("h3").text();
      var linkText = $this.children("h3").text();
      var container = "Feature";
      var containerIndex = i + 1;

      NCIAnalytics.CardClick(
        this,
        cardTitle,
        linkText,
        container,
        containerIndex
      );
    });
  });

  // Legacy side nav tracking.
  $("#nvcgSlSectionNav a").on("click.analytics", function (event) {
    //event.preventDefault(); //uncomment when testing link clicks
    var $this = $(this),
      root = $this.closest(".level-0"),
      heading = $.trim(root.children(":first").text()),
      parent = root.find(".level-1").is(".has-children")
        ? treeText($this.parents("li")).string
        : "",
      linkText = $this.text(),
      depth = treeText($this.parents("li")).depth;
    //console.log("url: " + url + "\nheading: " + heading  + "\nparent: " + parent + "\nlinkText: " + linkText + "\ndepth: " + depth);
    NCIAnalytics.SectionLinkClick(
      this,
      pageName,
      heading,
      linkText,
      depth,
      parent
    );
  });

  // Track footer links.
  // Join the study is for DCEG Connect.
  $("footer.site-footer").on("click", "a", function (e) {
    var $this = $(this);
    var $text = $this.text().trim();
    //Check for Join the study link, send to FooterJointheStudyLink instead of FooterLink if found
    if ($this.hasClass("borderless-button-yellow")) {
      var linkName = "dcegconnect_jointhestudy_footer";
      NCIAnalytics.FooterJointheStudyLink($this, $text, linkName);
    } else {
      NCIAnalytics.FooterLink($this, $text);
    }
  });

  // Track header Join the Study link.
  $(".navigation").on("click", "a.borderless-button-yellow", function (e) {
    var $this = $(this),
      $text = $this.text().trim(),
      linkName = "dcegconnect_jointhestudy_header";
    NCIAnalytics.HeaderJointheStudyLink($this, $text, linkName);
  });

  // Track Join the Study links in content.
  $("#content a.borderless-button-yellow").each(function (i, el) {
    $(el).on("click", function (event) {
      var $this = $(this);
      var name = "dceg_connect_jointhestudy_body";
      var index = i + 1;
      NCIAnalytics.JoinTheStudyBodyLink($this, name, index);
    });
  });

  // Track sitewide search submit.
  // This is tracking for the sitewide search box in the legacy header.
  $("#siteSearchForm").submit(function () {
    NCIAnalytics.SiteWideSearch(this);
  });
});

$(window).on("load", function () {
  // This is probably garbage for a bit, but it is in the original analytics.js
  // in this section. So it should stay here for now.
  var pageName = "D=pageName";

  // Left nav expand/collapse when there are items under a child section.
  // DCEG Connect is not deep enough for this to get triggered.
  $("#nvcgSlSectionNav button.toggle").on("click.analytics", function (event) {
    var $this = $(this),
      root = $this.closest(".level-0"),
      heading = $.trim(root.children(":first").text()),
      tree = treeText($this.parents("li:not(.level-0)")).string,
      isExpanded = $this.attr("aria-expanded") == "true";

    //console.log("url: " + url + "\nisExpanded: " + isExpanded  + "\nheading: " + heading  + "\nparent: " + parent + "\nevent: " + event.type);
    NCIAnalytics.SectionAccordionClick(
      this,
      pageName,
      isExpanded,
      heading,
      tree
    );
  });

  // This is the "tongue menu" on mobile, which is what the section nav becomes.
  $("#section-menu-button").on("click.analytics", function (e) {
    var sectionNav = $(".section-nav"),
      //sectionTitle = $.trim(sectionNav.find(".current-page").text()) //fetches current active element in the menu
      sectionTitle = $(".section-nav .level-0 a:first").text();
    if (!sectionNav.is(".open")) {
      NCIAnalytics.SectionMenuButtonClick(this, sectionTitle);
    }
  });
});
