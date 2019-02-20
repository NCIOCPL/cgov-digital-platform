// Polyfills for older browsers
// import './polyfills/custom_event';
// import './polyfills/replaceWith';
// import 'es6-promise/auto';
// import 'core-js/fn/array/from';
// import 'core-js/fn/array/find';
// import 'core-js/fn/array/includes';
// import 'core-js/fn/object/assign';
// import 'core-js/fn/object/entries';
// import 'core-js/fn/string/includes';
// import 'core-js/fn/string/starts-with';

import initializeCustomEventHandler from 'Core/libraries/customEventHandler';
initializeCustomEventHandler();

// import 'Common/Enhancements/analytics';
import './Common.scss';

// import $ from 'jquery';
// import 'Common/Enhancements/jQueryUIExtensions';
import popupFunctions from 'Libraries/popups/popup_functions';
popupFunctions();

// import 'Common/Plugins/Enlarge';
// import 'Plugins/jquery.nci.prevent_enter';

// import { buildOTP, makeOutline } from 'Common/Enhancements/NCI.page';
import search from 'Libraries/search/search';
import mobilemenu from 'Libraries/mainNav/mobilemenu';
import sectionNav from 'Libraries/sectionNav/sectionNav';
// import exitDisclaimer from 'Common/Enhancements/exitDisclaimer';
// import backToTop from 'Modules/backToTop/backToTop';
// import { makeAllAccordions } from 'Modules/accordion/accordion';
// import tableToggle from 'Modules/tableToggle/tableToggle';
// import flexVideo from 'Modules/videoPlayer/flexVideo';
// import formControls from 'Modules/forms/formControls';
// import tooltips from 'Modules/tooltips/referenceTooltip';

// // Unfortunately AMD doesn't play nice with export default;
// import proactiveLiveHelp from 'Modules/liveHelpPopup';
// import sortablejs from 'Modules/sortableTables';
import pageOptions from 'Libraries/pageOptions';

// import SiteWideSearch from 'Common/Enhancements/sitewidesearch';
import megaMenuModule from 'Libraries/megamenu/megamenu';
import headroomPlugin from 'Core/libraries/headroom/headroom';
// import DeepLinkPatch from 'Modules/utility/deepLinkPatch';
// import linkAudioPlayer from 'Modules/linkAudioPlayer/linkAudioPlayer';

// DeepLinkPatch();

//DOM Ready event
const onDOMContentLoaded = () => {

	// /*** BEGIN header component ***/
	megaMenuModule();

	headroomPlugin();

	// // This initializes jQuery UI Autocomplete on the site-wide search widget.
	// SiteWideSearch();

	// /*** BEGIN dictionary toggle ***/
	// // var dictionaryToggle = function () {
	// // 	$("#utility-dropdown").slideToggle(0, function () {
	// // 		$("#utility-dictionary").toggleClass('active');
	// // 	});
	// // }

	// backToTop();

	// /*** BEGIN mobile nav ("off-canvas flyout functionality") ***/

	// OCEPROJECT-3098 HACK to fix the Spanish mega menu on the Spanish homepage
	if (/^\/espanol\/?$/.test(location.pathname)) {
		$('#mega-nav .contains-current').removeClass('contains-current');
	}

	mobilemenu();

	sectionNav();

	search.init();

	// /*** END mobile nav ***/

	// /*** BEGIN Exit Disclaimer
	//  * This script looks for URLs where the href points to websites not in the federal domain (.gov) and if it finds one, it appends an image to the link. The image itself links to the exit disclaimer page.
	//  ***/
	// exitDisclaimer();

	pageOptions();

	// /*** BEGIN table toggling
	//  * This allows for toggling between tables.
	//  * An example can be seen on grants-research-funding.shtml,
	//  * as of the first commit with this code.
	//  ***/

	// // for each toggleable section...
	// tableToggle();

	// /*** END table toggling ***/

	// /*** BEGIN video embedding
	//  * This enables the embedding of YouTube videos and playlists as iframes.
	//  ***/
	// flexVideo();

	// /*** BEGIN form controls ***/
	// formControls();

	// /*** BEGIN accordionizer ***/
	// makeAllAccordions();

	// /*** BEGIN page outlining ***/
	// // generate the page outline -- this is used for all page-/document-level navigation
	// // set up outlines
	// $('article').each(function () {
	// 	var $this = $(this);

	// 	// check if there already is a built outline for this article
	// 	if ($this.data('nci-outline')) {
	// 		return;
	// 	}

	// 	// otherwise, build and set the outline
	// 	var outline = makeOutline(this);
	// 	$this.data('nci-outline', outline);
	// });

	// if ($('article').length > 0) {
	// 	buildOTP();
	// }
	// /*** END page outlining ***/

	// /*** BEGIN HACK for Blog Series titles
	//  * TODO: remove when Blog Dynamic List Percussion template is updated
	//  * with class name for <h3> ***/

	// $('div.blog-post').each(function () {
	// 	if ($(this).find('a.comment-count').length < 1) {
	// 		($(this).find('div.post-title h3').addClass('no-comments'))
	// 	}
	// });

	// // reference tooltips
	// tooltips();

	// // initialize the prevent-enter enhancement
	// $('[data-prevent-enter="true"]').NCI_prevent_enter();

	// // Proactive Live Help for CTS
	// proactiveLiveHelp();

};// END: DOM Ready event

document.addEventListener('DOMContentLoaded',onDOMContentLoaded);

// $(window).on('load', function () {
// 	// BEGIN Table Resizing
// 	//Table enlarging & scrollbar adding.
// 	//This marks all tables as scrollable, but only adds a shadow to the right side if it is scrolling.
// 	//Inspired by http://www.456bereastreet.com/archive/201309/responsive_scrollable_tables/

// 	$("#content table:not(.no-auto-enlarge)").overflowEnlarge();

// 	// IMPORTANT: sortabletables-js requires a specific DOM structure for the table it is added to
// 	// (consult https://github.com/BtheGit/sortable-js for more documentation). Because of this, it needs
// 	// to run AFTER the enlarge function above, which does some rewriting of the DOM to wrap a table in a figure
// 	// element, among other things.

// 	// NOTE: The custom settings are handled in a local wrapper module

// 	sortablejs();

// 	// Use custom audio player to override mp3 anchor links
// 	linkAudioPlayer();

// }); // END: Window Load Event
