// Polyfills for older browsers
import initializeCustomEventHandler from 'Core/libraries/customEventHandler';
initializeCustomEventHandler();

import 'Libraries/analytics/analytics';
import './Common.scss';

import $ from 'jquery';
import 'Core/libraries/jQueryUIExtensions/jQueryUIExtensions';
import popupFunctions from 'Libraries/popups/popup_functions';
popupFunctions();

import 'Core/libraries/enlarge/enlarge';
import 'Core/libraries/preventEnter/jquery.nci.prevent_enter';

import { buildOTP, makeOutline } from 'Core/libraries/pageOutline/NCI.page';
import search from 'Libraries/search/search';
import mobilemenu from 'Libraries/mainNav/mobilemenu';
import sectionNav from 'Libraries/sectionNav/sectionNav';
import exitDisclaimer from 'Libraries/exitDisclaimer/exitDisclaimer';
import backToTop from 'Core/libraries/backToTop/backToTop';
import { makeAllAccordions } from 'Core/libraries/accordion/accordion';
import tableToggle from 'Core/libraries/tableToggle/tableToggle';
import flexVideo from 'Core/libraries/videoPlayer/flexVideo';
import formControls from 'Core/libraries/formControls/formControls';
import tooltips from 'Core/libraries/tooltips/referenceTooltip';

// // Unfortunately AMD doesn't play nice with export default;
import {
	verifyShouldLiveHelpRun,
	initLiveHelp,
} from 'Core/libraries/liveHelpPopup';
import ProactiveLiveHelp from 'Core/libraries/liveHelpPopup/ProactiveLiveHelp';
import sortablejs from 'Core/libraries/sortableTables';
import pageOptions from 'Libraries/pageOptions';

import SiteWideSearch from 'Libraries/sitewideSearch/sitewideSearch';
import megaMenuModule from 'Libraries/megamenu/megamenu';
import DeepLinkPatch from 'Core/libraries/deepLinkPatch/deepLinkPatch';
import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import videoCarousel from 'Core/libraries/videoCarousel/video-carousel';
import { GoogleAPIKey } from 'Core/libraries/nciConfig/NCI.config';
import glossaryPopups from 'Libraries/popups/glossaryPopups';
import imageCarousel from 'Core/libraries/imageCarousel/image-carousel';
import floatingDelighter from 'Libraries/floatingDelighter';
import charts from 'Libraries/charts';

DeepLinkPatch();

// Check if floatingDelighters are enabled on the global config
const shouldShowFloatingDelighters = window.CDEConfig.showFloatingDelighters;

//DOM Ready event
const onDOMContentLoaded = () => {
	// /*** BEGIN header component ***/

	// Menu stuff
	mobilemenu();
	megaMenuModule();

	// This initializes jQuery UI Autocomplete on the site-wide search widget.
	SiteWideSearch();

	backToTop();

	/*** BEGIN mobile nav ("off-canvas flyout functionality") ***/

	// OCEPROJECT-3098 HACK to fix the Spanish mega menu on the Spanish homepage
	if (/^\/espanol\/?$/.test(location.pathname)) {
		$('#mega-nav .contains-current').removeClass('contains-current');
	}

	sectionNav();

	search.init();

	/*** END mobile nav ***/

	/*** BEGIN Exit Disclaimer
	 * This script looks for URLs where the href points to websites not in the federal domain (.gov) and if it finds one, it appends an image to the link. The image itself links to the exit disclaimer page.
	 ***/
	exitDisclaimer();

	pageOptions();

	/*** BEGIN table toggling
	 * This allows for toggling between tables.
	 * An example can be seen on grants-research-funding.shtml,
	 * as of the first commit with this code.
	 ***/

	// for each toggleable section...
	tableToggle();

	/*** END table toggling ***/

	/*** BEGIN video embedding
	 * This enables the embedding of YouTube videos and playlists as iframes.
	 ***/
	flexVideo();

	videoCarousel.apiInit(GoogleAPIKey);

	/*** BEGIN form controls ***/
	formControls();

	/*** BEGIN accordionizer ***/
	makeAllAccordions();

	/*** BEGIN page outlining ***/
	// generate the page outline -- this is used for all page-/document-level navigation
	// set up outlines
	$('article').each(function () {
		var $this = $(this);

		// check if there already is a built outline for this article
		if ($this.data('nci-outline')) {
			return;
		}

		// otherwise, build and set the outline
		var outline = makeOutline(this);
		$this.data('nci-outline', outline);
	});

	if ($('article').length > 0) {
		buildOTP();
	}
	/*** END page outlining ***/

	/*** BEGIN HACK for Blog Series titles
	 * TODO: remove when Blog Dynamic List Percussion template is updated
	 * with class name for <h3> ***/

	$('div.blog-post').each(function () {
		if ($(this).find('a.comment-count').length < 1) {
			$(this).find('div.post-title h3').addClass('no-comments');
		}
	});

	// reference tooltips
	tooltips();

	// initialize the prevent-enter enhancement
	$('[data-prevent-enter="true"]').NCI_prevent_enter();

	// expose Proactive Live Chat functions and classes for use with Launch
	window.MDUX = {};
	window.MDUX.verifyShouldLiveHelpRun = verifyShouldLiveHelpRun;
	window.MDUX.ProactiveLiveHelp = ProactiveLiveHelp;

	// initialize Proactive Live Help for CTS
	initLiveHelp();

	// Shim for handling drupal glossified terms
	glossaryPopups();

	imageCarousel();

	// Check global config as to whether floatingDelighters should be instantiated (#2229)
	if (shouldShowFloatingDelighters) {
		floatingDelighter();
	}

	charts();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

$(window).on('load', function () {
	// BEGIN Table Resizing
	//Table enlarging & scrollbar adding.
	//This marks all tables as scrollable, but only adds a shadow to the right side if it is scrolling.
	//Inspired by http://www.456bereastreet.com/archive/201309/responsive_scrollable_tables/

	$('#content table:not(.no-auto-enlarge)').overflowEnlarge();

	// IMPORTANT: sortabletables-js requires a specific DOM structure for the table it is added to
	// (consult https://github.com/BtheGit/sortable-js for more documentation). Because of this, it needs
	// to run AFTER the enlarge function above, which does some rewriting of the DOM to wrap a table in a figure
	// element, among other things.

	// NOTE: The custom settings are handled in a local wrapper module
	sortablejs();

	// Use custom audio player to override mp3 anchor links
	linkAudioPlayer();
}); // END: Window Load Event
