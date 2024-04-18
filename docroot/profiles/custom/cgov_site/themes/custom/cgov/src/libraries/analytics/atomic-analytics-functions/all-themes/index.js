import { legacyTrackOther } from "../../legacy-analytics-eddl-tracker";

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

    legacyTrackOther("PageNotFound", "PageNotFound", {
      Props: {
        11: searchType,
        14: keyword,
      },
      Evars: {
        11: searchType,
        13: "+1",
        14: keyword,
      },
      Events: [2],
    });
  },

  //******************************************************************************************************
  CustomLink: function (sender, linkData) {
    if (linkData == null || typeof linkData === "undefined") {
      linkData = "";
    }
    let data = linkData.split("|");
    let linkName = data[0] || "CustomLink";
    let label = data[1] || "";

    legacyTrackOther(linkName, "CustomLink", {
      Props: {
        4: sender.href,
        5: pageName,
        28: label,
      },
    });
  },

  /* ********************************************************************** */
  GovDelivery: function (sender, label) {

    legacyTrackOther('GovDelivery', "GovDelivery", {
      Props: {
        4: label,
        5: pageName,
      },
    });
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
      label = payload.label || "";

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
      }
    }

    const pageDetail = buildPageDetail() || "";
    const prop48 = payload.previousPageMaxVerticalTrackingString || "";

    legacyTrackOther("GlobalLinkTrack", "GlobalLinkTrack", {
      Props: {
        28: pageName + pageDetail,
        48: prop48,
        // This is from the original code. It is not clear what it was meant to do as
        // prop48 would never be undefined or null. So, 66 should always be set.
        ...(!prop48 ? { 66: (section ? section + "_" : '') + label.toLowerCase() } : {}),
      },
      Events: events,
    });
  },

  //******************************************************************************************************
  CardClick: function (sender, cardTitle, linkText, container, containerIndex) {
    legacyTrackOther('CardClick', 'CardClick', {
      Props: {
        57: cardTitle,
        58: linkText,
        59: container + ':' + containerIndex,
        60: 'D=pageName',
      },
      Events: [27],
    });
  },

  //******************************************************************************************************
  DynamicListItemClick: function (sender, title, index) {
    legacyTrackOther('DynamicListItemClick', 'SearchResults', {
      Props: {
        13: index,
        57: title,
        58: 'SearchResults',
        59: title + ':' + index,
        60: 'D=pageName',
      },
    });
  },
  //******************************************************************************************************
  VideoCarouselClickSwipe: function (sender, value) {
    legacyTrackOther('VideoCarouselClickSwipe', 'VideoCarouselClickSwipe', {
      Props: {
        66: value,
      },
      Events: [63],
    });
  },

  //******************************************************************************************************
  VideoCarouselComplete: function (sender, value) {
    legacyTrackOther('VideoCarouselComplete', 'VideoCarouselComplete', {
      Props: {
        66: value,
      },
      Events: [64],
    });
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
    legacyTrackOther('ImageCarouselClick', 'ImageCarouselClick', {
      Props: {
        66: 'imgcar_' + title + '_' + type + '_' + direction + '_' + imgNum,
      },
      Events: [62],
    });
  },

  //******************************************************************************************************
  Resize: function (sender, viewPort) {
    var linkName = "ResizedTo" + viewPort;

    legacyTrackOther(linkName, 'Resize', {
      Evars: {
        5: viewPort,
      },
      Events: [7],
    });
  },

  //******************************************************************************************************
  OnThisPageClick: function (sender, linkText, pageName) {
    linkText = "OnThisPage_" + linkText;
    var href = sender.getAttribute
      ? sender.getAttribute("href")
      : sender[0].getAttribute("href");

    legacyTrackOther('OnThisPageClick', 'OnThisPageClick', {
      Props: {
        4: href,
        66: linkText,
      },
      Events: [
        29,
        ...(linkText.search(/^OnThisPage_how\sto\sapply/gi) > -1 ? [105] : []),
      ],
    });
  },

  //******************************************************************************************************
  InThisSectionClick: function (sender, linkText, pageName) {
    legacyTrackOther('InThisSectionClick', 'InThisSectionClick', {
      Props: {
        66: 'InThisSection_' + linkText,
      },
      Events: [69],
    });
  },

  //******************************************************************************************************
  PDQMobileClick: function (sender, linkText, isExpanded, pageName) {
    var state = isExpanded
      ? "AccordionSectionExpand_"
      : "AccordionSectionCollapse_";

    legacyTrackOther('PDQMobileClick', 'PDQMobileClick', {
      Props: {
        66: state + linkText,
      },
      Events: isExpanded ? [31] : [32],
    });
  },

  //******************************************************************************************************
  CalloutBoxLinkTrack: function (sender, label, linkName) {
    let callOut = "CallOut";
    let link = linkName + callOut;
    let value = [linkName, callOut, label].join("_");

    legacyTrackOther(link, 'CalloutBoxLinkTrack', {
      Props: {
        66: value,
      },
    });
  },

  // Record that the proactive chat prompt was displayed.
  // sender - the element responsible for this event.
  RecordProactiveChatPromptDisplay: function (sender) {
    legacyTrackOther('ProactiveChat', 'ProactiveChatPromptDisplay', {
      Props: {
        5: "livehelp_proactive chat - display|" + pageName,
      },
      Events: [45],
    });
  },

  // Record that the proactive "Chat Now" button was clicked.
  // sender - the element responsible for this event.
  RecordProactiveChatPromptClick: function (sender) {
    legacyTrackOther('ProactiveChat', 'ProactiveChatPromptClick', {
      Props: {
        5: "livehelp_proactive chat - launch|" + pageName,
      },
      Events: [44],
    });
  },

  // Record that the proactive chat prompt was dismissed.
  // sender - the element responsible for this event.
  RecordProactiveChatPromptDismissal: function (sender) {
    legacyTrackOther('ProactiveChat', 'ProactiveChatPromptDismissal', {
      Props: {
        5: "livehelp_proactive chat - dismiss|" + pageName,
      },
      Events: [43],
    });
  },

  /* ********************************************************************** */
  glossifiedTerm: function (sender, linkText, blogLink) {
    legacyTrackOther('GlossifiedTerm', 'glossifiedTerm', {
      Props: {
        45: "Glossified Term",
        50: linkText,
        ...(blogLink ? { 66: concatCustomLink("BodyGlossifiedTerm") } : {}),
      },
      Events: [56],
    });
  },

  /* ********************************************************************** */
  RelatedResourceClick: function (sender, linkText, index) {
    legacyTrackOther('RelatedLinkClick', 'RelatedResourceClick', {
      Props: {
        50: linkText,
        66: getBlogLocation() ? concatCustomLink("BlogRelatedResource:" + index) : concatCustomLink("RelatedResource:" + index),
      },
      Events: getBlogLocation() ? [57] : [59],
    });
  },

  /* ============ Start Specific Blog Tracking ============= */
  /* ********************************************************************** */
  BlogArchiveLinkClick: function (sender, pageName) {
    var year = getQueryString("year", sender.href);
    var month = getQueryString("month", sender.href);

    legacyTrackOther('BlogArchiveDateClick', 'BlogArchiveLinkClick', {
      Props: {
        66: concatCustomLink("Archive"),
        50: year + (month ? ":" + month : ""),
      },
      Events: [55],
    });
  },
  /* ********************************************************************** */
  BlogSubscribeClick: function (sender, pageName) {
    legacyTrackOther('BlogSubscribeClick', 'BlogSubscribeClick', {
      Props: {
        66: concatCustomLink("Subscribe"),
      },
      Events: [58],
    });
  },
  /* ********************************************************************** */
  BlogArchiveAccordionClick: function (sender, pageName, collapse) {
    let action = collapse ? "Collapse:Archive" : "Expand:Archive";

    legacyTrackOther('BlogAccordionAction', 'BlogArchiveAccordionClick', {
      Props: {
        66: concatCustomLink(action),
      },
    });
  },

  /* ********************************************************************** */
  BlogBodyLinkClick: function (sender, linkText, pageName) {
    legacyTrackOther('BlogBodyLinkClick', 'BlogBodyLinkClick', {
      Props: {
        50: linkText,
        66: concatCustomLink("BodyLink"),
      },
      Events: [56],
    });
  },

  /* ********************************************************************** */
  BlogCardClick: function (sender, linkText, containerIndex, pageName) {
    legacyTrackOther('BlogFeatureCardClick', 'BlogCardClick', {
      Props: {
        66: concatCustomLink("BlogCard:" + containerIndex),
        50: linkText,
      },
      Events: [54],
    });
  },

  /* ********************************************************************** */
  FeaturedPostsClick: function (sender, linkText, containerIndex, pageName) {
    legacyTrackOther('FeaturedPostsClick', 'FeaturedPostsClick', {
      Props: {
        66: concatCustomLink("FeaturedPosts:" + containerIndex),
        50: linkText,
      },
      Events: [54],
    });
  },

  /* ********************************************************************** */
  CategoryClick: function (sender, linkText, containerIndex, pageName) {
    legacyTrackOther('CategoryClick', 'CategoryClick', {
      Props: {
        66: concatCustomLink("Category:" + containerIndex),
        50: linkText,
      },
      Events: [55],
    });
  },

  /* ********************************************************************** */
  OlderNewerClick: function (sender, olderNewer, pageName) {
    legacyTrackOther('OlderNewerClick', 'OlderNewerClick', {
      Props: {
        66: concatCustomLink(olderNewer),
      },
      Events: getBlogLocation() === "Post" ? [55] : [],
    });
  },

  /* ================ End blog tracking =============== */

  /* ********************************************************************** */
  TableSortHeaderClick: function (sender) {
    legacyTrackOther('SortTableHeaderClick', 'TableSortHeaderClick', {
      Props: {
        5: 'table_sort',
      },
    });
  },
  /* ********************************************************************** */
  ProfilePanelLinkClick: function (sender, linkText, token) {
    legacyTrackOther('ProfilePanelLinkClick', 'ProfilePanelLinkClick', {
      Props: {
        66: "InstitutionCard_" + token + "_" + linkText,
      },
    });
  },
  /* ********************************************************************** */
  InfographicClick: function (sender, linkData, pageName) {
    legacyTrackOther('InfographicClick', 'InfographicClick', {
      Props: {
        66: linkData,
      },
      Events: [71],
    });
  },
};
