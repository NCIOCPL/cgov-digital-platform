import ClickParams from "../helpers/click-params";
import concatCustomLink from "../helpers/concat-custom-link";
import getBlogLocation from "../helpers/get-blog-location";
import getQueryString from "../helpers/get-query-string";
import getSiteSection from "../helpers/get-site-section";
import buildPageDetail from "../helpers/build-page-detail";

// Old var for forcing the page name
const pageName = 'D=pageName';

/**
 * @file Analytics for both ncids_trans and cgov_common sites.
 */
export default {
  PageNotFound: function (sender) {
    var language = sender.dataset.language;
    var searchType = "pagenotfoundsearch";
    var keyword = document.getElementById("nfKeyword").value;

    if (language === "es") {
      searchType += "_spanish";
    }

    var clickParams = new ClickParams(sender, "nciglobal", "o", "PageNotFound");
    clickParams.Props = {
      11: searchType,
      14: keyword,
    };
    clickParams.Evars = {
      11: searchType,
      13: "+1",
      14: keyword,
    };
    clickParams.Events = [2];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  CustomLink: function (sender, linkData) {
    if (linkData == null || typeof linkData === "undefined") {
      linkData = "";
    }
    let data = linkData.split("|");
    let linkName = data[0] || "CustomLink";
    let label = data[1] || "";

    let clickParams = new ClickParams(sender, "nciglobal", "o", linkName);
    clickParams.Props = {
      4: sender.href,
      5: pageName,
      28: label,
    };
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  GovDelivery: function (sender, label) {
    let clickParams = new ClickParams(sender, "nciglobal", "o", "GovDelivery");
    clickParams.Props = {
      4: label,
      5: pageName,
    };
    clickParams.LogToOmniture();
  },
  //******************************************************************************************************
  /**
   * Generic / global link tracking method
   * @param {object} payload
   * @param {object=} [payload.sender=true] - html element clicked, defaults to Boolean true
   * @param {string} payload.label - text of link clicked
   * @param {string} payload.eventList - used to specify adobe success events
   * @param {string} payload.timeToClickLink - time (in seconds) elapsed from page load to first link clicked
   * @example GlobalLinkTrack({sender:this, label:this.textContent, siteSection: 'oga', eventList: 'ogapreaward'});
   */
  GlobalLinkTrack: function (payload) {
    const siteSection = getSiteSection();

    var events = "",
      eventsWithIncrementors = "", // placeholder for success events, if needed
      sender = payload.sender || true, // default to Boolean true if no object passed
      label = payload.label || "",
      hash = document.location.hash,
      isTrackable = true;

    if (payload.eventList) {
      switch (payload.eventList.toLowerCase()) {
        case "ogapreaward":
          events = [101];
          break;
        case "ogareceiving":
          events = [102];
          break;
        case "ogacloseout":
          events = [103];
          break;
        case "cctappdownload":
          events = [104];
          break;

        case "ccthowtoapply":
          events = [105];
          break;

        case "timetoclick":
          eventsWithIncrementors = payload.timeToClickLink
            ? ["106=" + payload.timeToClickLink]
            : "";
          break;
      }
    }

    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "GlobalLinkTrack"
    );
    var pageDetail = buildPageDetail() || "";

    clickParams.Props = {
      28: pageName + pageDetail,
      48: payload.previousPageMaxVerticalTrackingString || "",
    };
    if (!clickParams.Props[48]) {
      clickParams.Props[66] =
        (section ? section + "_" : "") + label.toLowerCase();
    }

    clickParams.Events = events;
    clickParams.EventsWithIncrementors = eventsWithIncrementors;
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  CardClick: function (sender, cardTitle, linkText, container, containerIndex) {
    var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'CardClick');
    clickParams.Props = {
      57: cardTitle,
      58: linkText,
      59: container + ':' + containerIndex,
      60: 'D=pageName',
    };

    clickParams.Events = [27];

    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  DynamicListItemClick: function (sender, title, index) {
    var clickParams = new ClickParams(sender, 'nciglobal', "o", 'SearchResults');
    clickParams.Props = {
      13: index,
      57: title,
      58: 'SearchResults',
      59: title + ':' + index,
      60: 'D=pageName',
    };

    clickParams.LogToOmniture();
  },
  //******************************************************************************************************
  VideoCarouselClickSwipe: function (sender, value) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "VideoCarouselClickSwipe"
    );

    clickParams.Props = {
      66: value,
      67: pageName,
    };

    clickParams.Events = [63];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  VideoCarouselComplete: function (sender, value) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "VideoCarouselComplete"
    );

    clickParams.Props = {
      66: value,
      67: pageName,
    };

    clickParams.Events = [64];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  ImageCarouselClickSwipe: function (
    sender,
    title,
    type,
    direction,
    imgNum,
    pageName
  ) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "ImageCarouselClick"
    );

    clickParams.Props = {
      66: "imgcar_" + title + "_" + type + "_" + direction + "_" + imgNum,
      67: pageName,
    };

    clickParams.Events = [62];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  Resize: function (sender, viewPort) {
    var width = "ResizedTo" + viewPort;
    var clickParams = new ClickParams(sender, "nciglobal", "o", width);
    clickParams.Evars = {
      5: viewPort,
    };
    clickParams.Events = [7];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  OnThisPageClick: function (sender, linkText, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "OnThisPageClick"
    );
    linkText = "OnThisPage_" + linkText;
    var href = sender.getAttribute
      ? sender.getAttribute("href")
      : sender[0].getAttribute("href");
    clickParams.Props = {
      4: href,
      66: linkText,
      67: pageName,
    };
    clickParams.Events = [29];

    // account for cct 'how to apply' success event
    if (linkText.search(/^OnThisPage_how\sto\sapply/gi) > -1) {
      clickParams.Events.push(105);
    }

    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  InThisSectionClick: function (sender, linkText, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "InThisSectionClick"
    );

    clickParams.Props = {
      66: "InThisSection_" + linkText,
      67: pageName,
    };
    clickParams.Events = [69];

    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  PDQMobileClick: function (sender, linkText, isExpanded, pageName) {
    var state = isExpanded
      ? "AccordionSectionExpand_"
      : "AccordionSectionCollapse_";
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "PDQMobileClick"
    );

    clickParams.Events = isExpanded ? [31] : [32];

    clickParams.Props = {
      66: state + linkText,
      67: pageName,
    };

    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  CalloutBoxLinkTrack: function (sender, label, linkName) {
    let callOut = "CallOut";
    let link = linkName + callOut;
    let value = [linkName, callOut, label].join("_");
    let clickParams = new ClickParams(sender, "nciglobal", "o", link);

    clickParams.Props = {
      66: value,
    };
    clickParams.LogToOmniture();
  },

  // Record that the proactive chat prompt was displayed.
  // sender - the element responsible for this event.
  RecordProactiveChatPromptDisplay: function (sender) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "ProactiveChat"
    );
    clickParams.Props = {
      5: "livehelp_proactive chat - display|" + pageName,
    };
    clickParams.Events = [45];
    clickParams.LogToOmniture();
  },

  // Record that the proactive "Chat Now" button was clicked.
  // sender - the element responsible for this event.
  RecordProactiveChatPromptClick: function (sender) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "ProactiveChat"
    );
    clickParams.Props = {
      5: "livehelp_proactive chat - launch|" + pageName,
    };
    clickParams.Events = [44];
    clickParams.LogToOmniture();
  },

  // Record that the proactive chat prompt was dismissed.
  // sender - the element responsible for this event.
  RecordProactiveChatPromptDismissal: function (sender) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "ProactiveChat"
    );
    clickParams.Props = {
      5: "livehelp_proactive chat - dismiss|" + pageName,
    };
    clickParams.Events = [43];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  glossifiedTerm: function (sender, linkText, blogLink) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "glossifiedTerm"
    );

    clickParams.Props = {
      45: "Glossified Term",
      50: linkText,
      67: pageName,
    };

    if (blogLink) {
      clickParams.Props[66] = concatCustomLink("BodyGlossifiedTerm");
    }

    clickParams.Events = [56];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  RelatedResourceClick: function (sender, linkText, index) {
    let clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "RelatedLinkClick"
    );

    clickParams.Props = {
      67: pageName,
      50: linkText,
    };

    // Add location if exists.
    if (getBlogLocation()) {
      clickParams.Events = [57];
      clickParams.Props[66] = concatCustomLink("BlogRelatedResource:" + index);
    } else {
      clickParams.Events = [59];
      clickParams.Props[66] = concatCustomLink("RelatedResource:" + index);
    }

    clickParams.LogToOmniture();
  },

  /* ============ Start Specific Blog Tracking ============= */
  /* ********************************************************************** */
  BlogArchiveLinkClick: function (sender, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "BlogArchiveDateClick"
    );
    var year = getQueryString("year", sender.href);
    var month = getQueryString("month", sender.href);

    clickParams.Props = {
      66: concatCustomLink("Archive"),
      67: pageName,
      50: year + (month ? ":" + month : ""),
    };
    clickParams.Events = [55];
    clickParams.LogToOmniture();
  },
  /* ********************************************************************** */
  BlogSubscribeClick: function (sender, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "BlogSubscribeClick"
    );

    clickParams.Props = {
      66: concatCustomLink("Subscribe"),
      67: pageName,
    };

    clickParams.Events = [58];
    clickParams.LogToOmniture();
  },
  /* ********************************************************************** */
  BlogArchiveAccordionClick: function (sender, pageName, collapse) {
    let clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "BlogAccordionAction"
    );
    let action = "Archive";
    if (collapse) {
      action = "Collapse:" + action;
    } else {
      action = "Expand:" + action;
    }

    clickParams.Props = {
      66: concatCustomLink(action),
      67: pageName,
    };
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  BlogBodyLinkClick: function (sender, linkText, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "BlogBodyLinkClick"
    );
    clickParams.Props = {
      50: linkText,
      66: concatCustomLink("BodyLink"),
      67: pageName,
    };

    clickParams.Events = [56];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  BlogCardClick: function (sender, linkText, containerIndex, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "BlogFeatureCardClick"
    );

    clickParams.Props = {
      66: concatCustomLink("BlogCard:" + containerIndex),
      67: pageName,
      50: linkText,
    };

    clickParams.Events = [54];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  FeaturedPostsClick: function (sender, linkText, containerIndex, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "FeaturedPostsClick"
    );

    clickParams.Props = {
      66: concatCustomLink("FeaturedPosts:" + containerIndex),
      67: pageName,
      50: linkText,
    };

    clickParams.Events = [54];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  CategoryClick: function (sender, linkText, containerIndex, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "CategoryClick"
    );

    clickParams.Props = {
      66: concatCustomLink("Category:" + containerIndex),
      67: pageName,
      50: linkText,
    };

    clickParams.Events = [55];
    clickParams.LogToOmniture();
  },

  /* ********************************************************************** */
  OlderNewerClick: function (sender, olderNewer, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "OlderNewerClick"
    );

    clickParams.Props = {
      66: concatCustomLink(olderNewer),
      67: pageName,
    };

    if (getBlogLocation() == "Post") {
      clickParams.Events = [55];
    }

    clickParams.LogToOmniture();
  },

  /* ================ End blog tracking =============== */

  /* ********************************************************************** */
  TableSortHeaderClick: function (sender) {
    let clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "SortTableHeaderClick"
    );
    clickParams.Props = {
      5: "table_sort",
    };
    clickParams.LogToOmniture();
  },
  /* ********************************************************************** */
  ProfilePanelLinkClick: function (sender, linkText, token) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "ProfilePanelLinkClick"
    );

    clickParams.Props = {
      66: "InstitutionCard_" + token + "_" + linkText,
      67: pageName,
    };
    clickParams.LogToOmniture();
  },
  /* ********************************************************************** */
  InfographicClick: function (sender, linkData, pageName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "InfographicClick"
    );

    clickParams.Events = [71];
    clickParams.Props = {
      66: linkData,
      67: pageName,
    };
    clickParams.LogToOmniture();
  },
};
