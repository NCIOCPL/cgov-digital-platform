import ClickParams from "../helpers/click-params";
import getSiteSection from "../helpers/get-site-section";

// Old var for forcing the page name
const pageName = 'D=pageName';

/**
 * @file Legacy NCIAnalytics functions for only the cgov_common theme.
 */
export default {
  //*********************** onclick functions ************************************************************
  SiteWideSearch: function (sender) {
    var searchType = "sitewide";
    var keyword = " ";
    if (
      document.getElementById("swKeyword") &&
      document.getElementById("swKeyword").value
    ) {
      keyword = document.getElementById("swKeyword").value;
    }
    if (
      document.getElementById("swKeywordQuery") &&
      document.getElementById("swKeywordQuery").value
    ) {
      keyword = document.getElementById("swKeywordQuery").value;
    }
    // if (s.prop8.toLowerCase() == 'spanish')
    // searchType += '_spanish';

    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "SiteWideSearch"
    );
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
  eMailLink: function (sender) {
    const siteSection = getSiteSection();

    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "eMailLink"
    );

    clickParams.Props = {
      43: "Email",
      66:
        (siteSection ? siteSection + "_" : "") +
        "email",
    };

    clickParams.Events = [17];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  PrintLink: function (sender) {
    const siteSection = getSiteSection();
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "PrintLink"
    );

    clickParams.Props = {
      43: "Print",
      66:
        (siteSection ? siteSection + "_" : "") +
        "print",
    };

    clickParams.Events = [17];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  FooterLink: function (sender, footerName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "FooterLink-" + footerName
    );
    clickParams.Props = {
      36: footerName,
    };
    clickParams.Evars = {
      36: footerName,
    };
    clickParams.Events = [16];
    clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  HeaderJointheStudyLink: function (sender, headerName, linkName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "HeaderLink-" + headerName
    );
    clickParams.Props = {
      53: headerName,
      54: headerName,
      55: headerName,
      56: pageName,
      66: linkName,
      67: "D=pageName",
    };
    clickParams.Evars = {
      53: headerName,
    };
    clickParams.Events = [20, 26];
    clickParams.LogToOmniture();
  },
  //******************************************************************************************************
  FooterJointheStudyLink: function (sender, footerName, linkName) {
    var clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "JoinTheStudyFooterLink"
    );
    clickParams.Props = {
      36: footerName,
      66: linkName,
    };
    clickParams.Evars = {
      36: footerName,
    };
    clickParams.Events = [16, 20];
    clickParams.LogToOmniture();
  },
  /* ********************************************************************** */
  JoinTheStudyBodyLink: function (sender, name, index) {
    let clickParams = new ClickParams(
      sender,
      "nciglobal",
      "o",
      "GovDelivery"
    );
    clickParams.Props = {
      66: name + index,
      67: pageName,
    };
    clickParams.Events = [20];
    clickParams.LogToOmniture();
  },
    //******************************************************************************************************
    MegaMenuClick: function (sender, tree) {
      var clickParams = new ClickParams(sender,
          'nciglobal', 'o', 'MegaMenuClick');

      var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
      if (typeof pageNameOverride !== 'undefined') {
          localPageName = pageNameOverride;
      }

      /*
       * tree.length == 1 : section/tab level
       * tree.length == 2 : subsection level
       * tree.length == 3 : link level
       */

      if (typeof tree[1] === 'undefined') {
          clickParams.Props = {
              53: tree[0].text,
              54: tree[0].text,
              55: tree[0].text,
              56: pageName
          };
          clickParams.Evars = {
              53: tree[0].text
          };
      }

      if (typeof tree[1] !== 'undefined') {
          // click was sub-section or link-level
          clickParams.Props = {
              53: tree[1].text,
              54: tree[0].text,
              55: tree[0].text,
              56: pageName
          };
          clickParams.Evars = {
              53: tree[1].text
          };
      }

      if (typeof tree[2] !== 'undefined') {
          // click was link-level
          clickParams.Props = {
              53: tree[2].text,
              54: tree[1].text,
              55: tree[0].text,
              56: pageName
          };
          clickParams.Evars = {
              53: tree[2].text
          };
      }

      clickParams.Events = [26];
      clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  MegaMenuDesktopReveal: function (sender, menuText) {
      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'MegaMenuDesktopReveal');

      clickParams.Events = [28];
      clickParams.Evars = {
          52: menuText,
          43: "Mega Menu"
      };
      clickParams.Props = {
          52: menuText
      };
      clickParams.LogToOmniture();
  },


  //******************************************************************************************************
  MegaMenuMobileReveal: function (sender) {
      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileReveal');

      clickParams.Events = [28];
      clickParams.Evars = {
          43: "Hamburger Menu"
      };
      clickParams.LogToOmniture();
  },


  //******************************************************************************************************
  MegaMenuMobileAccordionClick: function (sender, isExpanded, tree) {
      var state = isExpanded ? "Expand" : "Collapse";

      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileAccordionClick');

      clickParams.Events = isExpanded ? [34] : [35];
      clickParams.Props = {
          73: state + "|" + tree
      };
      clickParams.LogToOmniture();
  },


  //******************************************************************************************************
  MegaMenuMobileLinkClick: function (sender, url, linkText, linkUrl, heading, subHeading) {
      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileLinkClick');

      clickParams.Events = [26];
      clickParams.Evars = {
          53: heading
      };
      clickParams.Props = {
          53: heading,
          54: subHeading,
          55: linkText,
          56: url
      };
      clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  LogoClick: function (sender) {
      var clickParams = new ClickParams(sender,
          'nciglobal', 'o', 'Logolick');

      var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
      if (typeof pageNameOverride !== 'undefined') {
          localPageName = pageNameOverride;
      }

      clickParams.Props = {
          53: 'NCI Logo',
          56: pageName
      };

      clickParams.Evars = {
          53: 'NCI Logo'
      };

      clickParams.Events = [26];
      clickParams.LogToOmniture();
  },

  /* ============== Side Navigation Stuff ============ */
    //******************************************************************************************************
    SectionMenuButtonClick: function (sender, heading) {
      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'SectionMenuButtonClick');

      clickParams.Events = [30];
      clickParams.Evars = {
          43: "Section Menu",
          45: heading
      };
      clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  SectionAccordionClick: function (sender, url, isExpanded, heading, parent) {
    const siteSection = getSiteSection();
      const state = isExpanded ? "Expand" : "Collapse";
      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'SectionAccordionClick');

      clickParams.Events = isExpanded ? [31] : [32];
      clickParams.Evars = {
          43: "Section Menu",
          45: heading
      };
      clickParams.Props = {
          68: state + "|" + parent,
          66: ((siteSection) ? siteSection + '_' : '') + state.toLowerCase() + "|" + parent.toLowerCase()
      };
      clickParams.LogToOmniture();
  },

  //******************************************************************************************************
  SectionLinkClick: function (sender, url, heading, linkText, depth) {
    const siteSection = getSiteSection();
      var clickParams = new ClickParams(sender, 'nciglobal', 'o', 'SectionLinkClick');

      clickParams.Events = [33];

      // account for cct 'how to apply' success event
      if(linkText.search(/^how\sto\sapply/gi) > -1) {
          clickParams.Events.push(105);
      }

      clickParams.Evars = {
          43: "Section Menu",
          45: heading
      };
      clickParams.Props = {
          66: ((siteSection) ? siteSection + '_' : '') + linkText.toLowerCase(),
          69: heading,
          70: linkText,
          71: depth,
          72: url
      };
      clickParams.LogToOmniture();
  },

};
