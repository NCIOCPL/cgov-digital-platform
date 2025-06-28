import $ from "jquery";
import NCIAnalytics from "Core/libraries/analytics/atomic-analytics-functions/all-themes/index";

// Set a name for the view port based on the current screen size
function getWidthForAnalytics() {
  var screen = "";
  if (window.innerWidth) {
    if (window.innerWidth > 1440) {
      screen = "Extra wide";
    } else if (window.innerWidth > 1024) {
      screen = "Desktop";
    } else if (window.innerWidth > 640) {
      screen = "Tablet";
    } else {
      screen = "Mobile";
    }
  }
  return screen;
}

$(document).ready(function () {

  // If the screen is resized past a different breakpoint, track the variable and event
  function trackViewPortResize() {
    var viewPortResized = getWidthForAnalytics();
    if (viewPortLoaded != viewPortResized) {
      if (typeof NCIAnalytics !== "undefined") {
        if (typeof NCIAnalytics.Resize === "function") {
          NCIAnalytics.Resize(this, viewPortResized);
        }
      }
      viewPortLoaded = viewPortResized;
    }
    return viewPortResized;
  }

  /** Functions to track screen size changes */
  var viewPortLoaded = getWidthForAnalytics(); // Set var for browser width on page load
  window.onresize = trackViewPortResize; // If the current browser screen is resized, call the trackViewPortResize() function

  // Used by Special reports AND DCEG Connect homepage.
  $(".borderless-container").each(function (i, el) {
    $(el).on("click.analytics", "a", function (event) {
      var $this = $(this),
        $borderlessContainer = $(this).parents(".borderless-container"),
        cardTitle = "";
      if ($borderlessContainer.hasClass("dceg_connect")) {
        cardTitle = $borderlessContainer.find("h1").first().text().trim();
      } else {
        cardTitle = $borderlessContainer.find("h2").first().text().trim();
      }
      var linkText = cardTitle;
      var container = "fullwidth";
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

  // This is a Special Report content type for the cards that have a title before the image.
  $(".title-first-feature-card-link").each(function (i, el) {
    $(el).on("click.analytics", function (event) {
      var $alternatingImageContainer = $(this);
      var cardTitle = $alternatingImageContainer
        .find("h3")
        .first()
        .text()
        .trim();
      var linkText = cardTitle;
      var container = "titleFirst";
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

  // Track thumbnail clicks.
  // Used by managed lists on mini landing pages.
  $(".managed.list .general-list-item.has-media").each(function (i, el) {
    let $this = $(this);
    let $title = $this.find("h3").text().trim();
    let $container = "Thumbnail";
    let $containerIndex = i + 1;

    $(el).on("click.analytics", "a.image", function (e) {
      NCIAnalytics.CardClick(
        this,
        $title,
        "Image",
        $container,
        $containerIndex
      );
    });

    $(el).on("click.analytics", "a.title", function (e) {
      NCIAnalytics.CardClick(this, $title, $title, $container, $containerIndex);
    });
  });

  // Track dynamic list link clicks.
  // Used by dynamic lists on mini landing pages (press release archive and upcoming/past events)
  $(".dynamic.list .general-list-item").each(function (i, el) {
    let $this = $(this);
    let $title = $("article h1").text().trim();
    let $listTitle = $this.closest(".dynamic.list").find("h2").text().trim();
    let $index = i + 1;

    $(el).on("click.analytics", "a", function () {
      $title = $listTitle || $title;
      NCIAnalytics.DynamicListItemClick($this, $title, $index);
    });
  });

  // This is for cancer type hompage tracking.
  $(".cthp-card-container .cthpCard").each(function (i, el) {
    $(el).on("click.analytics", "a", function (event) {
      var $this = $(this);
      var cardTitle = $this.closest(".cthpCard").find("h2:first").text();
      var linkText = $this.text();
      var container = "CTHP";
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

  // Track clicks on on Topic Page Featured Card
  // Used by the 2 card feature row on mini landing pages.
  $(".topic-feature .feature-card").each(function (i, el) {
    $(el).on("click.analytics", "a", function (event) {
      var $this = $(this);
      // if the card is inside the intro text or body then it is an inline card
      var isInline = $this.parents("#cgvBody,#cgvIntroText")[0];
      var cardTitle = $this.children("h3").text();
      var linkText =
        event.target.tagName.toLowerCase() == "img"
          ? "Image"
          : $this.children("h3").text();
      var container = isInline ? "InlineCard" : "SlottedTopicCard";
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

  // Track GovDelivery links. Look for data attribute only, no value needed.
  // This can happen in many places in content.
  $('#content a[href*="govdelivery.com"], a.news-govdelivery, a.blogRSS').on(
    "click.analytics",
    function () {
      let $this = $(this);
      let $name = "GovDelivery";
      if ($this.find("img, figure").length) {
        $name += "Image";
      }
      if ($('html[lang="es"]').length) {
        $name += "Esp";
      }
      NCIAnalytics.GovDelivery($this, $name);
    }
  );

  // Track callout box links if not GovDelivery.
  $('[class*="callout-box"]').on("click.analyics", "a", function () {
    let $this = $(this);
    if (!$this[0].href.includes("govdelivery.com")) {
      let $title = $("h1").first().text().replace(/\s/g, "");
      let $text = $this.text().replace(/\s/g, "");
      NCIAnalytics.CalloutBoxLinkTrack($this, $text, $title);
    }
  });

  // Track generic custom links. Attribute value: [text].
  // This is to support tracking of random links in content, where we have identified
  // we need tracking past the normal exit link tracking.
  $("a[data-custom-link]").on("click.analytics", function () {
    let $this = $(this);
    let $data = $this.data("custom-link").trim();
    NCIAnalytics.CustomLink($this, $data);
  });

  // Track search submit on 404 page.
  $("#pageNotFoundSearchForm").submit(function () {
    NCIAnalytics.PageNotFound(this);
  });
}); //end document ready

// Analytics for components generated by JavaScript
$(window).on("load", function () {
  // Use the Adobe dynamic pageName value.
  var pageName = "D=pageName";
  var pathname = window.location.pathname;

  //Track "Go to Health Professional Version" and
  // "Go to Patient Version" links on PDQ pages.
  $(".pdq-hp-patient-toggle").on("click", "a", function () {
    NCIAnalytics.GlobalLinkTrack({
      sender: this, // html link element
      label: $(this).text(), // text displayed to user
    });
  });

  // Track clicks on blog archives accordion on all blog pages.
  $("#blog-archive-accordion").on("click", "a", function () {
    NCIAnalytics.BlogArchiveLinkClick(this, pageName);
  });

  // Track the expand/collapse of the accordion
  $("#blog-archive-accordion").on("click", "h3, h4", function () {
    var isClosing = !$(this).hasClass("ui-state-active");
    NCIAnalytics.BlogArchiveAccordionClick(this, pageName, isClosing);
  });

  $(".blogRSS").on("click", function () {
    NCIAnalytics.BlogSubscribeClick(this, pageName);
  });

  $("#cgvBody.cgvblogpost").on("click", "a:not(.definition)", function () {
    var $this = $(this);
    var linkText = $this.text();
    NCIAnalytics.BlogBodyLinkClick(this, linkText, pageName);
  });

  // This is for glossary popup tracking on content pages.
  $("#cgvBody").on("click", ".definition", function () {
    var linkText = this.innerText;
    var blogLink = $("#cgvBody").hasClass("cgvblogpost") ? true : false;
    NCIAnalytics.glossifiedTerm(this, linkText, blogLink);
  });
  $(".cgdp-field-intro-text").on("click", ".cgdp-definition-link", function () {
    // Typing this made me get a little sick in the mouth. Until #3005 is
    // implemented in the next release we need to just capture the legacy
    // analytics for glossary links that fire the popups. Which is what
    // is above. So once #3005 goes in this and the above popup tracker
    // should be removed.
    var linkText = this.innerText;
    NCIAnalytics.glossifiedTerm(this, linkText, false);
  });


  // Track clicks on feature cards on blog posts.
  $(".blog-feature .feature-card").each(function (i, el) {
    $(el).on("click", "a", function (event) {
      var $this = $(this);
      var linkText = $this.children("h3").text();
      var containerIndex = i + 1;

      NCIAnalytics.BlogCardClick(this, linkText, containerIndex, pageName);
    });
  });

  // Track clicks on featured posts section of Blog Right Rail.
  $(".right-rail .managed.list.with-date li").each(function (i, el) {
    $(el).on("click", "a", function (event) {
      var $this = $(this);
      var linkText = $this.text();
      var containerIndex = i + 1;

      NCIAnalytics.FeaturedPostsClick(this, linkText, containerIndex, pageName);
    });
  });

  // Track clicks on featured posts section of Blog Right Rail.
  $(".right-rail .managed.list.without-date li").each(function (i, el) {
    $(el).on("click", "a", function (event) {
      var $this = $(this);
      var linkText = $this.text();
      var containerIndex = i + 1;

      NCIAnalytics.CategoryClick(this, linkText, containerIndex, pageName);
    });
  });

  // Track Newer Post(s) link clicks on Blogs.
  $(".blog-pager a.newer, .blog-post-newer a").on("click", function () {
    NCIAnalytics.OlderNewerClick(this, "Newer", pageName);
  });

  // Track Older Post(s) link clicks on Blogs.
  $(".blog-pager a.older, .blog-post-older a").on("click", function () {
    NCIAnalytics.OlderNewerClick(this, "Older", pageName);
  });

  //Sort Table Analytics
  //so userHasSorted so that analytics fires only on very first instance of sort
  var userHasSorted = false;
  $("table[data-sortable]").on("click.analytics", "th", function () {
    if (userHasSorted) {
      return;
    }
    NCIAnalytics.TableSortHeaderClick(this);
    userHasSorted = true;
  });

  // This is the Article and PDQ "On this page" section link tracking
  $(".on-this-page a").on("click", function () {
    var $this = $(this);
    var linkText = $this.text();
    NCIAnalytics.OnThisPageClick($this, linkText, pageName);
  });

  // Tracks clicks of "In This Section" menu items on PDQ pages
  // These mostly appear on HP content, and not patient
  $(".in-this-section a").on("click", function () {
    var $this = $(this);
    var linkText = $this.text();
    NCIAnalytics.InThisSectionClick($this, linkText, pageName);
  });

  // Tracks clicks on expand/collapse of the accordion sections within PDQ pages on mobile
  $(".summary-sections").on("click", ".ui-accordion-header", function () {
    var $this = $(this);
    var linkText = $this.text();
    var isExpanded = $this.attr("aria-expanded") == "true";
    NCIAnalytics.PDQMobileClick($this, linkText, isExpanded, pageName);
  });

  // Track clicks on website url of profile panel pages.
  // This appears on Biography and Cancer Center pages
  $("div.profile-panel-content a").on("click", function (e) {
    var $this = $(this);
    var href = e.target.href;
    var isPhoneNumber = href.match(/^tel\:./i);
    var linkText = isPhoneNumber ? "phone" : "website";
    var name = pathname.match(/([^\/]*)\/*$/)[1];

    NCIAnalytics.ProfilePanelLinkClick($this, linkText, name);
  });

  // Tracks clicks of "View and Print" link on infographic items.
  $(".infographic-link").on("click", function () {
    var $this = $(this);
    var title = $this.attr("data-link_title");
    var linkData = "viewprint|inline|" + title;

    NCIAnalytics.InfographicClick($this, linkData, pageName);
  });
});
