
import $ from 'jquery';
import DictionaryService from 'Core/libraries/dictionaryService';
import * as config from 'Core/libraries/nciConfig/NCI.config';
import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';

var lang = $('html').attr('lang') || 'en';
// Set the language for finding the dictionary term/definition
var longLang = 'English';
if (lang === 'es') {
	longLang = 'Spanish';
}

// Intended as a public function
var _initialize = function (settings) {
	var term = _fetchTerm();
	$.when(_getDefinition(term)).done(function (termObject) {
		if (termObject.result.length > 0) {
			_render(termObject.result[0].term);
		}
	});
};

//Intended as a private function
// get the term from the search results page within the results class
var _fetchTerm = function () {
	var searchParam = $('.results .term:first').text();
	return searchParam;
};

// get the full definition from the dictionary service
var _getDefinition = function (term) {
	return DictionaryService.search('term', _fetchTerm(), longLang, 'exact');
};

// render the defintion to produce the content and html
var _render = function (obj) {
	// console.log("inside render with:", obj);
	var term = '<dt class="term"><strong>' + obj.term + '</strong></dt>';
	var audio = "";
	var pronunciation = "";

	// check if pronunciation exists before building the audio and pronunciation of the definition
	if (obj.pronunciation) {
		audio = '<a href="' + obj.pronunciation.audio + '" class="CDR_audiofile"><span class="hidden">listen</span></a> ';
		pronunciation = obj.pronunciation.key;
	}
	// toggle controls whether to show first sentence or full definition in mobile
	var toggle = '<div id="best-bets-toggle"><a href="#"><span id="definitionShowHide">' + config.lang.Show[lang] + '</span> ' + config.lang.Definition_Show_Full[lang] + '</a></div>';

	var definition = obj.definition.html;
	// this is to pull out newline characters which have been found to interfere with the period + blank space method for identifying end of first sentence, ie in "tumor" definition.
	definition = definition.replace(/(\r\n|\n|\r)/gm," ");
	// break the definition into first sentence and rest for display in mobile
	var definitionStart =  definition.slice(0, definition.indexOf('. ') + 1);
	var definitionEnd = definition.slice(definition.indexOf('. ') + 1);

	// in cases where there is only one sentence, assign it to first and make the rest an empty string
	if (definitionStart === '') {
		definitionStart = '<span id="definitionStart">' + definition + '</span>';
		definitionEnd = '';
		toggle = '';
	}
	else {
		definitionStart = '<span id="definitionStart">' + definitionStart + '</span>';
		definitionEnd = '<span id="definitionEnd">' + definitionEnd + '</span>';
	}

	// the box takes all the components and puts them together in the defintion box
	var box = '<div id="best-bet-definition"><h2>' + config.lang.Definition_Title[lang] + ':</h2><dl>' + term + '<dd class="pronunciation">' + audio + pronunciation + ' </dd><dd class="definition">' + definitionStart + definitionEnd + moreInfo() + '</dd></dl>'  + toggle + ' </div><div id="dictionary_jPlayer"></div>';

	if ($('.featured.sitewide-results')[0]) {
		// html rules for within best bets
		var wrapper = $('<div class="large-4 small-12 columns collapse">' + box + '</div>');
		var target = $('.featured.sitewide-results');
		target.wrapInner('<div class="large-8 small-12 columns collapse"></div>').append(wrapper);
	} else {
		// html rules for not within best bets
		var wrapper = $('<div>' + box + '</div>');
		var target = $('.sitewide-results');
		wrapper.insertBefore(target);
	}

	$("#best-bets-toggle a").on("click", function (event) {
		event.preventDefault();
		var $this = $(this);
		if ($this.is('.expanded')) {
			$('#definitionEnd').hide(250);
			$this.removeClass('expanded');
			$('#definitionShowHide').text(config.lang.Show[lang]);

		} else {
			$('#definitionEnd').show(250);
			$this.addClass('expanded');
			$('#definitionShowHide').text(config.lang.Hide[lang]);
		}
	});
	// The audioplayer setup is called only once on page load, so we need to
	// initialize it again for audiolinks added dynamically, but scoped to only the
	// new element to avoid potential duplication on existing elements.
	linkAudioPlayer("#best-bet-definition .CDR_audiofile");

	function moreInfo() {
		// issue, some objects don't exist for some definitons, produces an error. I answered by checking for existance and then length
		if ((obj.videos && obj.videos.length > 0) || (obj.images && obj.images.length > 0) || (obj.related_drug_summary && obj.related.drug_summary.length > 0) || (obj.related.external && obj.related.external.length > 0) || (obj.related.summary && obj.related.summary.length > 0) || (obj.related.term && obj.related.term.length > 0)) {
			if (lang === "es") {
				return '<p id="moreInfo"><a href="/espanol/publicaciones/diccionario?CdrID=' + obj.id + '">' + config.lang.Dictionary_More_Information[lang] + '</a></p>';
			}
			else {
				return '<p id="moreInfo"><a href="/publications/dictionaries/cancer-terms?CdrID=' + obj.id + '">' + config.lang.Dictionary_More_Information[lang] + '</a></p>';
			}
		} else {
			return '';
		}
	}
};

let initialized = false;
export default {
	init: function(settings) {
		if (initialized) {
			return;
		}

		initialized = true;
		_initialize(settings);
	}
}
