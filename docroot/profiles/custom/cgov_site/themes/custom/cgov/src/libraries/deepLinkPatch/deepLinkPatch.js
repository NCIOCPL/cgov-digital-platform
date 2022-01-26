/*** BEGIN deeplinking fix
 * This script fixes the scroll position for deeplinking.
 ***/
 import $ from 'jquery';

 /**
  * This is the selector for anchor content, This should probably be provided by
  * the accordion code and added asadditional data on the event object so it does
  * not get out of sync here when changes are made.
  */
 const ACCORDION_CONTENT_SELECTOR = '.ui-accordion-content';
 const ACCORDION_SELECTOR = '.ui-accordion';

 /**
  * Helper function to clean up legacy PDQ anchor links.
  *
  * Over the years there have been many modifications to how PDQ displayed
  * the top-level sections of a summary. The hrefs for those anchors do not
  * always match up with the actual ID elements, so they have to be massaged.
  *
  * Additionally, PDQ is not the only thing to use anchors & accordions, so
  * some of these rules might have been for those things.
  *
  * @param {string} hash the hash fragment to cleanup.
  * @returns the cleaned link.
  */
 const cleanAnchorLink = (hash) => {
     // PDQ summaries have links like href="#link/_57". This was done to support the old way
     // of displaying "multi-page" summaries. The ids of the elements are things like id="_57".
     // The hrefs are still like that, so this first replace is to remove anything before a
     // '/' in the anchor.
     //
     // Additionally, citation links in PDQ will begin with "#cit/", which other code is looking
     // for to wireup the citation popups and other stuff. So we need to clean this up from the
     // hash to match the id attribute we want.
     const	anchorId = hash.substr(1).replace(/^.+\//);

     return anchorId;
 }


 function _initialize() {
   // Previously this deeplinking patch was used to handle many cases in which an anchor would not
   // appear in a users browser window correctly. Old PDQ summaries used a lightweight hash router
   // to determine which page of the summary to display, we needed to scroll to the subsection.
   // The old sticky nav would always cover up anchor content, so we needed to scroll the page down
   // such that the anchor appeared under the sticky nav. Finally, we had to handle linking to anchors
   // within collapse accordion section.
   //
   // Requirements changes over the years have only left us with the accordion requirement, so this file
   // is now just tailored to that use case.

   // This is a bugfix for #3288 where some legacy #link/_57 links are still hanging around.
   const linkRegex = /^([^#]+)#link\/(.*)$/;
   document.querySelectorAll('a[href*="#link/"]').forEach((link) => {
     // So yeah. The links are not just anchors, but they may also contain the rest of the URL, event
     // for linking within the document. :( So this needs to be more complicated.
     const oldHref = link.getAttribute('href');
     const matches = oldHref.match(linkRegex);
     if (matches) {
       link.setAttribute('href', `${matches[1]}#${matches[2]}`);
     }
   });

   // When the accordion is drawn, expand either the section or the subsection of that accordion. This
   // will occur on a load, a resize, or clicking the back button.
   window.addEventListener('nci.accordion.create', function (event) {

     if (!location.hash) {
       return;
     }

     findAndExpandAnchorInAccodion(
       cleanAnchorLink(location.hash),
       event.target
     );
   });

   window.addEventListener('hashchange', function(event) {
     // This should only fire when clicking on an anchor within the loaded page.
     // We do this all the time because of the odd cases where we have accordions on desktop.
     // The findAndExpandAnchorInAccodion is smart enough to find the correct accordion and
     // let's the browser handle the scrolling if we are in an open section.

     if (!location.hash) {
       return;
     }

     findAndExpandAnchorInAccodion(cleanAnchorLink(location.hash));
   });
 }

 /**
  * Finds the nearest accordion section for the given anchor.
  * ASSUMPTION: the anchor will never be the accordion section.
  *
  * @param {Element} anchorEl the anchor
  */
 const getNearestAccordionSection = (anchorEl) => {

   // Let's see if there is a parent section to this anchor.
   const parentSection = anchorEl.closest(ACCORDION_CONTENT_SELECTOR);
   if (parentSection) {
     return parentSection;
   }

   // If the anchor is the ID of a section of an accordion, then there will not
   // be a parent. However it should have a child.
   const childSection = anchorEl.querySelector(ACCORDION_CONTENT_SELECTOR);
   return childSection;
 }

 /**
  * Helper function to find a hash within an accordion.
  *
  * @param {string} anchorId The anchor that we are looking for.
  * @param {Element} activeAccordion The active accordion Element we are looking for. (Default: null)
  * @returns {Boolean} true if accordion found and expanded.
  */
  const findAndExpandAnchorInAccodion = (anchorId, activeAccordion = null) => {

   // Let's find that element with that anchor id
   const anchorEl = document.getElementById(anchorId);
   if (!anchorEl) {
     // The anchor does not exist on the page.
     return false;
   }

   // Let's see if our anchor is in an accordion. If it is not in an accordion, we move on.
   const accordion = anchorEl.closest(ACCORDION_SELECTOR);
   if (!accordion || (activeAccordion !== null && accordion !== activeAccordion)) {
     // There is no accordion wrapping this selector -- that sound bogus,
     // OR the accordion we found is not the active one. (We can have multiple
     // accordions on a page)
     return false;
   }

   // This anchor is in an accordion, so let's find its section.
   const accordionSection = getNearestAccordionSection(anchorEl);

   if (!accordionSection) {
     // The anchor exists, it is in an accordion, but not in or near a section.
     return false;
   }

   if (accordionSection.classList.contains('accordion-content-active')) {
     // I think this means that the anchor is currently in an open section and
     // thus the browser will just normally handle the scroll.
     return false;
   }

   // Now we expand the accordion. This will use jQuery for now because that is our
   // accordion. The assumption here is that the accordion should be active if this
   // code here was called.
   const $accordion = $(accordion);

   // Get the index of where the panel appears so we can open this section.
   // Gonna be honest, I don't know when this would not be valid. This code is only
   // hit when we are an anchor in a panel IN the accordion, so should NOT be possible
   // for index to not exist.
   const accordionIndex = $accordion.data('ui-accordion').panels.index(accordionSection);


   // Open the accordion section, but add an event listener to listen for the accordion actually
   // being opened. Once opened we can scroll, however we should only fire this off once.
   // (We don't want to call the scroll event every time someone does an expand/collapse/expand)
   $accordion.one('accordionactivate', function(event) {
     // We may need to determine what the previous scroll position was, however, scrolling to the
     // anchor in the URL is better than "maintaining" scroll and showing the footer.
     anchorEl.scrollIntoView(true);
   });
   $accordion.accordion('option', 'active', accordionIndex);
   return true;
 };

 let initialized = false;
 export default function() {
   if (initialized) {
     return;
   }

   initialized = true;
   _initialize();
 }
 /*** END deeplinking fix ***/
