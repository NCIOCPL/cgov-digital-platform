import $ from "jquery";
const CDEConfig = window.CDEConfig || {};

const legacyFilterSet = (_, el) => {
  return (
    /^https?\:\/\/([a-zA-Z0-9\-]+\.)+/i.test(el.href) &&
    !/^https?\:\/\/([a-zA-Z0-9\-]+\.)+gov/i.test(el.href) &&
    !/^https?\:\/\/([a-zA-Z0-9\-]+\.)+acquia-sites\.com/i.test(el.href) &&
    el.href !== "" &&
    el.href.indexOf(location.protocol + "//" + location.hostname) !== 0 &&
    !$(el).hasClass("add_this_btn") &&
    !$(el).hasClass("toolbar-item") && // Drupal admin toolbar selector
    !$(el).hasClass("no-exit-notification") &&
    !$(el).hasClass("usa-link") &&
    $(el).parents(".cgdp-embed-card").length === 0 // Don't add external icon for embedded cards, they have their own
  );
};

const ncidsFilterSet = (_, el) => {
  return legacyFilterSet(_, el) && Boolean(el.closest(".cgdpl"));
};

/*** BEGIN Exit Disclaimer
 * This script looks for URLs where the href points to websites
 * not in the federal domain (.gov) and if it finds one, it appends
 * an image to the link. The image itself links to the exit
 * disclaimer page.
 * Changed code to exclude the exit icon from images within the anchor tag.
 ***/
function _initialize(filterSetName) {
  const filterSet =
    filterSetName === "ncids" ? ncidsFilterSet : legacyFilterSet;
  const lang = $("html").attr("lang") || "en";
  const path =
    CDEConfig.exitDisclaimerHref && CDEConfig.exitDisclaimerHref[lang];
  const altText =
    lang === "es" ? "Notificaci\u00F3n de salida" : "Exit Disclaimer";

  // Looks for all non .gov links (that do not include an image immediately inside the anchor tag) and adds external link href aftr the link.
  $("a[href]:not(:has(>img))")
    .filter(filterSet)
    .after(
      $(
        '<a class="icon-exit-notification" title="' +
          altText +
          '" href="' +
          path +
          '">' +
          '<span class="show-for-sr">' +
          altText +
          "</span>" +
          "</a>"
      )
    );

  // move the feature card exit notification within the dom to come right after the image in the feature card to meet design request, WCMSFEQ-282
  $(".feature-card a.icon-exit-notification").insertAfter(
    '.feature-card a:not([href^="/"]):not([href*=".gov"]) div img'
  );

  // move the exit link for alternating images
  $(".alternating-image-list-container  a.icon-exit-notification").each(
    function () {
      $(this).insertAfter(
        $(this).prev().find(".alternating-image-list-text :header span")
      );
    }
  );
}

let initialized = false;
export default function (filterSetName) {
  if (initialized) return;

  initialized = true;
  _initialize(filterSetName);
}
/*** END Exit Disclaimer ***/
