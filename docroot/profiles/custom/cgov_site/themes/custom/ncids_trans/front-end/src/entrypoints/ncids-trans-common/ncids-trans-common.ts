import './ncids-trans-common.scss';
import './ncids-trans-common-legacy.scss';

// NCIDS Imports
import usaBannerInit from '../../lib/components/usa-banner';
import usaSidenavInit from '../../lib/components/usa-sidenav';
import usaBreadcrumbInit from '../../lib/components/usa-breadcrumb';
import usaFooterInit from '../../lib/components/usa-footer';
import usaSiteAlertInit from '../../lib/components/usa-site-alert';
import nciHeaderInit from '../../lib/components/nci-header';

// CGDP Imports
import cgdpPageOptionsInit from '../../lib/components/cgdp-page-options';

import cgdpDefinitionInit from '../../lib/components/cgdp-definition';

/* *********************************************************************
 * There is a LOT of legacy junk going on in here. We do want this to be
 * typescript, but that also means we need types for things that have
 * no types. So throughout this file we will need to litter definitions
 * for things on the window, or even jquery.
 **********************************************************************/

// Window things used throughout this file.
// For the CDEConfig, as we migrate stuff to TS, each module that has
// things on the CDEConfig should define those individual items.
declare global {
	interface Window {
		/** Helper functions for live help. Why it is on the window, IDK. */
		MDUX: {
			verifyShouldLiveHelpRun: unknown;
			ProactiveLiveHelp: unknown;
		};
	}

	// jQuery Extensions
	interface JQuery {
		NCI_prevent_enter: () => unknown;
		overflowEnlarge: (options: unknown) => unknown;
	}
}

// Legacy modal container for jQuery UI dialogs and our homegrown modal.
document.body.insertAdjacentHTML(
	'beforeend',
	`<div id="nci-modal-area" class="cgdpl"></div>`
);

import initializeCustomEventHandler from 'Core/libraries/customEventHandler';
initializeCustomEventHandler();

import 'Libraries/analytics/analytics';

import * as $ from 'jquery';

// This is a hack to ensure that we only add dialogs to a place on the page
// wrapped with a .cgdpl class. This allow legacy styles to work in any
// dialogs.
$.extend($.ui.dialog.prototype.options, {
	appendTo: '#nci-modal-area',
});

import 'Core/libraries/jQueryUIExtensions/jQueryUIExtensions';

import 'Core/libraries/enlarge/enlarge';
import 'Core/libraries/preventEnter/jquery.nci.prevent_enter';

// import { buildOTP, makeOutline } from 'Core/libraries/pageOutline/NCI.page';
import exitDisclaimer from 'Libraries/exitDisclaimer/exitDisclaimer';
// import { makeAllAccordions } from 'Core/libraries/accordion/accordion';
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

import DeepLinkPatch from 'Core/libraries/deepLinkPatch/deepLinkPatch';
import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import charts from 'Libraries/charts';

// HACK for R4.1 Reorging
import NCIAnalytics from 'Core/libraries/analytics/atomic-analytics-functions/all-themes/index';

DeepLinkPatch();

//DOM Ready event
const onDOMContentLoaded = () => {
	/* NCIDS Event Handlers will come first. */
	// Initialize the Banner/Language toggle.
	usaBannerInit();

	// Init the header.
	nciHeaderInit();

	// Initialize the Sidenav
	usaSidenavInit();

	// Init Breadcrumbs
	usaBreadcrumbInit();

	// Init the footer
	usaFooterInit();

	//Init the site alert
	usaSiteAlertInit();
	// Init the page options
	cgdpPageOptionsInit();

	/*** BEGIN Exit Disclaimer
	 * This script looks for URLs where the href points to websites not in the federal domain (.gov) and if it finds one, it appends an image to the link. The image itself links to the exit disclaimer page.
	 ***/
	exitDisclaimer('ncids');

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

	/*** BEGIN form controls ***/
	formControls();

	/*** BEGIN accordionizer ***/
	// Turning off accordions. Will have another spike to investigate how accordions
	// will work for the new styles and requirements.
	// makeAllAccordions();

	/*** BEGIN page outlining ***/
	// generate the page outline -- this is used for all page-/document-level navigation
	// set up outlines
	// $('article').each(function () {
	// 	const $this = $(this);

	// 	// check if there already is a built outline for this article
	// 	if ($this.data('nci-outline')) {
	// 		return;
	// 	}

	// 	// otherwise, build and set the outline
	// 	const outline = makeOutline(this);
	// 	$this.data('nci-outline', outline);
	// });

	// if ($('article').length > 0) {
	// 	buildOTP();
	// }
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
	window.MDUX = {
		verifyShouldLiveHelpRun,
		ProactiveLiveHelp,
	};

	// initialize Proactive Live Help for CTS
	initLiveHelp();

	cgdpDefinitionInit();

	charts();

	/* /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/ */
	// Hack for govdelivery tracking on body content now that we
	// have removed <div id="content"> from the markup. This will
	// need to be adjusted as the body changes.
	//
	// Track GovDelivery links. Look for data attribute only, no value needed.
	// This can happen in many places in content.
	$('#cgvBody a[href*="govdelivery.com"]').on('click.analytics', function () {
		const $this = $(this);
		let $name = 'GovDelivery';
		if ($this.find('img, figure').length) {
			$name += 'Image';
		}
		if ($('html[lang="es"]').length) {
			$name += 'Esp';
		}
		NCIAnalytics.GovDelivery($this, $name);
	});
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

$(window).on('load', function () {
	// BEGIN Table Resizing
	//Table enlarging & scrollbar adding.
	//This marks all tables as scrollable, but only adds a shadow to the right side if it is scrolling.
	//Inspired by http://www.456bereastreet.com/archive/201309/responsive_scrollable_tables/

	$('#cgvBody table:not(.no-auto-enlarge)').overflowEnlarge({
		xlThreshold: 30000,
	});

	// IMPORTANT: sortabletables-js requires a specific DOM structure for the table it is added to
	// (consult https://github.com/BtheGit/sortable-js for more documentation). Because of this, it needs
	// to run AFTER the enlarge function above, which does some rewriting of the DOM to wrap a table in a figure
	// element, among other things.

	// NOTE: The custom settings are handled in a local wrapper module
	sortablejs();

	// Use custom audio player to override mp3 anchor links
	linkAudioPlayer();
}); // END: Window Load Event
