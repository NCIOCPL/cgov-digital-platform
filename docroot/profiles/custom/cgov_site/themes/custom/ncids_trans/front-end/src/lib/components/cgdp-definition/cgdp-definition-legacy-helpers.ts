// phpcs:disable
/*
This is a stop-gap measure until we can refactor the popups further.
At the moment popup_functions runs prior to other code in Common.js, allowing
it to overwrite several window functions that would ordinarily open new windows, instead
now rendering their contents as a modal popup. It also ignores the specified language and instead pulls that
off the page.

The reason for this stopgap is that we want to avoid instantiating more than one modal at a time and
a refactor is required to ensure the modals exist as a singleton service.

For now, for expediency's sake, we are going to simply identify all glossified links that have been generated in the newer
CKEditor glossifier and attach to them the popWindow function that popup_functions has already previously overwritten with the
same parameters it expects.

IMPORTANT: Because we don't want to apply this shim to all links, we can't use the default class="definition" since that
won't act as an adequate filter. And since we need to manually pass the params for this callback, we may as well do double duty
and identify links based on the paramstring data attribute. Since the current override version of popWindow only reads
off the id anyway, we really can just attach that as a data attribute. However we still need to construct the param string
that the override deconstructs (until that process is refactored) so for now we will do that here where it is closer to the
future refactor point.

NOTE: Right now popup_functions both looks for CDR0000xxx and strips the prefix (so we have to maintain that format
in the data attribute) and uses the document language instead of the passed param.
*/

/*
 Update 6/1/2020 - This really should not use popup_functions. That was always a bit klunky and now that we are redoing the
 dictionary service, it is even harder to figure out what is going on. While the modal singleton is an issue, we should not
 have anything other than the dictionary using popup_functions. Most of the help pages should actually be in app modules,
 which are going away. (and if they are not going away, there is a problem because /common will be going away.)

 Additionally, based on conversations and investigations in the CDR, we did not see any use cases where a Spanish page would
 link to an English definition or vice-versa. So we are going to use the Page's language to determine which definition language
 to fetch.
 */

import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { getDictionaryResponseFromData, resetModal } from './modal-controls';

// @Bryan, I'm mad - Derek
export const getDocumentLanguage = (document = window.document) => {
	// MIGRATION NOTE:
	// The fallback values were added during migration because a content-language attribute was not available
	// at the time this file was ported.
	const language = document.querySelector('meta[name="content-language"]')
		? document
				?.querySelector('meta[name="content-language"]')
				?.getAttribute('content')
		: document.documentElement.lang
		? document.documentElement.lang
		: 'en';
	return language;
};

/**
 * It is not as simple as having some default values. The defaults changed based on the
 * combination of parameters.
 * @param {*} dictionary the provided dictionary
 * @param {*} audience the provided audience
 */
const getParamsOrDefaults = (glossary: string, audience: string) => {
	// Our default glossary is the Dictionary of Cancer Terms, which only has Patient
	// definitions. And is the ONLY glossary that HAS Patient definitions.
	// So any other glossary is for HP and the logic below handles that.
	if (!glossary && !audience) {
		return { glossary: 'Cancer.gov', audience: 'Patient' };
	}

	if (audience && !glossary) {
		switch (audience.toLowerCase()) {
			case 'patient':
				return { glossary: 'Cancer.gov', audience: 'Patient' };

			case 'healthprofessional':
				return { glossary: 'NotSet', audience: 'HealthProfessional' };

			default:
				return { glossary: 'Unknown', audience };
		}
	}

	if (glossary && !audience) {
		return {
			glossary,
			audience:
				glossary.toLowerCase() === 'cancer.gov'
					? 'Patient'
					: 'HealthProfessional',
		};
	}

	return { glossary, audience };
};

/**
 * This will convert the ID (either CDR0000 or string as number) into an int
 *
 * @param {string} id
 */
const cleanId = (id: string) => {
	return parseInt(id.replace('CDR', ''));
};

/**
 * Fixes casing issues with know audiences.
 *
 * @param {string} audience audience string
 */
const cleanKnownAudience = (audience: string) => {
	if (audience && audience.toLowerCase() === 'patient') {
		return 'Patient';
	}

	if (audience && audience.toLowerCase() === 'healthprofessional') {
		return 'HealthProfessional';
	}

	return audience;
};

/**
 * Parses query parameters from a URL string.
 * @param {string} url - The URL containing query parameters.
 * @returns {Record<string, string>} An object containing key-value pairs of query parameters.
 */
const parseQueryParameters = (url: string): Record<string, string> => {
	const queryString = url.split('?')[1];
	if (!queryString) {
		return {};
	}

	return queryString
		.split('&')
		.reduce((params: Record<string, string>, param) => {
			const [key, value] = param.split('=');
			params[decodeURIComponent(key)] = decodeURIComponent(value);
			return params;
		}, {});
};

/**
 * The function for handling the click of a definition term
 * The function takes the modal in as a parameter, and initiates a fetch
 * request to get the term's definition and other data
 * Populates the modal on success, including initializing an audio player
 * @param modal the modal on the page being used for definitions
 */
export const definitionClickHandler =
	(
		glossary: string,
		audience: string,
		language: string,
		glossaryId: number,
		modal: USAModal
	) =>
	async (evt: Event) => {
		evt.preventDefault();
		// Puts loading text in the modal in case the request takes time
		resetModal(modal);
		modal.handleModalOpen(evt);
		const eventTarget = evt.currentTarget as HTMLElement;
		if (!eventTarget) throw new Error('Event Target is null or undefined');
		getDictionaryResponseFromData(
			glossary,
			audience,
			language,
			glossaryId,
			modal
		);
	};

/**
 * These glossary terms have been glossified using Drupal. They are all for the Dictionary of
 * Cancer Terms and they all match the pattern like:
 *
 * <a class="definition" data-glossary-id="CDR0000046014" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046014&amp;version=Patient&amp;language=English">malnutrition</a>
 */
export const addListenersToDrupalGlossaryTerms = (modal: USAModal) => {
	// Find all links that are identifiable as CKEditor-glossified links. Otherwise exit.
	// (Unfortunately this will run on every page for the time being, so we want to avoid resource-intensive operations
	// beyond the initial DOM query.)
	//const glossaryLinks = getNodeArray('a.definition[data-glossary-id]');
	const glossaryLinks = document.querySelectorAll(
		'a.definition[data-glossary-id]'
	);
	if (!glossaryLinks.length) return;

	glossaryLinks.forEach((glossaryLink) => {
		// Extract the data- params
		const element = glossaryLink as HTMLElement;
		const glossaryId = cleanId(element.dataset.glossaryId || '');
		const { glossary, audience } = getParamsOrDefaults(
			element.dataset.glossaryName || '',
			cleanKnownAudience(element.dataset.glossaryAudience || '')
		);

		glossaryLink.removeAttribute('onclick');
		glossaryLink.addEventListener(
			'click',
			definitionClickHandler(
				glossary,
				audience,
				getDocumentLanguage(document) || 'en',
				glossaryId,
				modal
			)
		);
	});
};

/**
 * This handles all the legacy glossary link patterns.
 *
 * Instead of looking at onclick handlers, we should just look at the href to get
 * the params for the definition. They all match a pattern like:
 * <a class="definition" onclick="javascript:popWindow('defbyid','CDR0000045693&amp;version=Patient&amp;language=English'); return false;" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045693&amp;version=Patient&amp;language=English">genes</a>
 */
export const addListenersToPdqAndLegacyGlossaryTerms = (modal: USAModal) => {
	// Find all legacy links. Otherwise exit.
	// (Unfortunately this will run on every page for the time being, so we want to avoid resource-intensive operations
	// beyond the initial DOM query.)
	const glossaryLinks = document.querySelectorAll(
		'a.definition[href*="popDefinition.aspx"]:not([data-glossary-id])'
	);
	if (!glossaryLinks.length) return;

	glossaryLinks.forEach((element) => {
		// Get the query params from the href
		const params = parseQueryParameters(element.getAttribute('href') || '');

		const glossaryId = cleanId(params.id);
		const { glossary, audience } = getParamsOrDefaults(
			// This is a backwards compatibility hack for issues in PDQ content not using the
			// correct glossary name in their links!
			params.dictionary && params.dictionary.toLowerCase() === 'genetic'
				? 'genetics'
				: params.dictionary,
			cleanKnownAudience(params.version)
		);
		// Remove the onclick handler
		element.removeAttribute('onclick');
		element.addEventListener(
			'click',
			definitionClickHandler(
				glossary,
				audience,
				getDocumentLanguage(document) || 'en',
				glossaryId,
				modal
			)
		);
	});
};
