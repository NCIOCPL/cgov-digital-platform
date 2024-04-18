import { legacyTrackOther } from "../../legacy-analytics-eddl-tracker";

import getSiteSection from "../helpers/get-site-section";

// Old var for forcing the page name
const pageName = 'D=pageName';

/**
 * @file Legacy NCIAnalytics functions for only the cgov_common theme.
 */
export default {
  //*********************** onclick functions ************************************************************
  SiteWideSearch: function (sender) {
    const searchType = "sitewide";

    // It is like we are cave-people and we cannot use ?. or ??.
    const swKeywordEl = document.getElementById("swKeyword");
    const swKeywordQueryEl = document.getElementById("swKeywordQuery");
    const swKeywordElValue = swKeywordEl && swKeywordEl.value;
    const swKeywordQueryElValue = swKeywordQueryEl && swKeywordQueryEl.value;

    const keyword = swKeywordElValue ? swKeywordElValue :
      swKeywordQueryElValue ? swKeywordQueryElValue : " ";

    legacyTrackOther('SiteWideSearch', 'SiteWideSearch', {
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
  eMailLink: function (sender) {
    const siteSection = getSiteSection();
    legacyTrackOther('eMailLink', 'eMailLink', {
      Props: {
      43: "Email",
      66: (siteSection ? siteSection + "_" : "") + "email",
      },
      Events: [17],
    });
  },

  //******************************************************************************************************
  PrintLink: function (sender) {
    const siteSection = getSiteSection();
    legacyTrackOther('PrintLink', 'PrintLink', {
      Props: {
      43: "Print",
      66: (siteSection ? siteSection + "_" : "") + "print",
      },
      Events: [17],
    });
  },

  //******************************************************************************************************
  FooterLink: function (sender, footerName) {
    legacyTrackOther('FooterLink-' + footerName, 'FooterLink', {
      Props: {
        36: footerName,
      },
      Evars: {
        36: footerName,
      },
      Events: [16],
    });
  },

  //******************************************************************************************************
  HeaderJointheStudyLink: function (sender, headerName, linkName) {
    legacyTrackOther('HeaderLink-' + headerName, 'HeaderJointheStudyLink', {
      Props: {
        53: headerName,
        54: headerName,
        55: headerName,
        56: pageName,
        66: linkName,
      },
      Evars: {
        53: headerName,
      },
      Events: [20, 26],
    });
  },
  //******************************************************************************************************
  FooterJointheStudyLink: function (sender, footerName, linkName) {
    legacyTrackOther('JoinTheStudyFooterLink', 'FooterJointheStudyLink', {
      Props: {
        36: footerName,
        66: linkName,
      },
      Evars: {
        36: footerName,
      },
      Events: [16, 20],
    });
  },
  /* ********************************************************************** */
  JoinTheStudyBodyLink: function (sender, name, index) {
    legacyTrackOther('GovDelivery', 'JoinTheStudyBodyLink', {
      Props: {
        66: name + index,
      },
      Events: [20],
    });
  },
  //******************************************************************************************************
  MegaMenuClick: function (sender, tree) {
    var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL

    /*
      * tree.length == 1 : section/tab level
      * tree.length == 2 : subsection level
      * tree.length == 3 : link level
      */

    const prop53 = typeof tree[2] !== 'undefined' ? tree[2].text :
      typeof tree[1] !== 'undefined' ? tree[1].text : tree[0].text;
    const prop54 = typeof tree[2] !== 'undefined' ? tree[1].text : tree[0].text;
    const prop55 = tree[0].text;

    legacyTrackOther('MegaMenuClick', 'MegaMenuClick', {
      Props: {
        53: prop53,
        54: prop54,
        55: prop55,
        56: pageName,
      },
      Evars: {
        53: prop53,
      },
      Events: [26],
    });
  },

  //******************************************************************************************************
  MegaMenuDesktopReveal: function (sender, menuText) {
    legacyTrackOther('MegaMenuDesktopReveal', 'MegaMenuDesktopReveal', {
      Props: {
        52: menuText,
      },
      Evars: {
        52: menuText,
        43: "Mega Menu",
      },
      Events: [28],
    });
  },

  //******************************************************************************************************
  MegaMenuMobileReveal: function (sender) {
    legacyTrackOther('MegaMenuMobileReveal', 'MegaMenuMobileReveal', {
      Evars: {
        43: "Hamburger Menu",
      },
      Events: [28],
    });
  },

  //******************************************************************************************************
  MegaMenuMobileAccordionClick: function (sender, isExpanded, tree) {
    const state = isExpanded ? "Expand" : "Collapse";

    legacyTrackOther('MegaMenuMobileAccordionClick', 'MegaMenuMobileAccordionClick', {
      Props: {
        73: state + "|" + tree,
      },
      Events: isExpanded ? [34] : [35],
    });
  },


  //******************************************************************************************************
  MegaMenuMobileLinkClick: function (sender, url, linkText, linkUrl, heading, subHeading) {
    legacyTrackOther('MegaMenuMobileLinkClick', 'MegaMenuMobileLinkClick', {
      Props: {
        53: heading,
        54: subHeading,
        55: linkText,
        56: url
      },
      Evars: {
        53: heading
      },
      Events: [26],
    });
  },

  //******************************************************************************************************
  LogoClick: function (sender) {
    var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL

    legacyTrackOther('Logolick', 'LogoClick', {
      Props: {
        53: 'NCI Logo',
        56: pageName
      },
      Evars: {
        53: 'NCI Logo'
      },
      Events: [26],
    });
  },

  /* ============== Side Navigation Stuff ============ */
  //******************************************************************************************************
  SectionMenuButtonClick: function (sender, heading) {
    legacyTrackOther('SectionMenuButtonClick', 'SectionMenuButtonClick', {
      Props: {
        43: "Section Menu",
        45: heading,
      },
      Events: [30],
    });
  },

  //******************************************************************************************************
  SectionAccordionClick: function (sender, url, isExpanded, heading, parent) {
    const siteSection = getSiteSection();
    const state = isExpanded ? "Expand" : "Collapse";

    legacyTrackOther('SectionAccordionClick', 'SectionAccordionClick', {
      Props: {
        68: state + "|" + parent,
        66: ((siteSection) ? siteSection + '_' : '') + state.toLowerCase() + "|" + parent.toLowerCase()
      },
      Evars: {
        43: "Section Menu",
        45: heading
      },
      Events: isExpanded ? [31] : [32],
    });
  },

  //******************************************************************************************************
  SectionLinkClick: function (sender, url, heading, linkText, depth) {
    const siteSection = getSiteSection();
    legacyTrackOther('SectionLinkClick', 'SectionLinkClick', {
      Props: {
        66: ((siteSection) ? siteSection + '_' : '') + linkText.toLowerCase(),
        69: heading,
        70: linkText,
        71: depth,
        72: url
      },
      Evars: {
        43: "Section Menu",
        45: heading
      },
      Events: [
        33,
        ...(linkText.search(/^how\sto\sapply/gi) > -1 ? [105] : []),
      ],
    });
  },
};
