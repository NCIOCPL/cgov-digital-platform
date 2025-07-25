// This entire file is full of legacy functions for older definition links and legacy popups
// Sometime in the new, glorious future we're going to ELIMINATE WITH PREJUDICE most (if not all) of this file

import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { getDictionaryResponseFromElement, resetModal } from './modal-controls';
import { DEFINITION_LINK_SELECTORS } from './cgdp-definition';

/**
 * It is not as simple as having some default values. The defaults changed based on the
 * combination of parameters.
 * @param {*} dictionary the provided dictionary
 * @param {*} audience the provided audience
 */
export const getParamsOrDefaults = (glossary: string, audience: string) => {
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
export const cleanId = (id: string) => {
	return parseInt(id.replace('CDR', ''));
};

/**
 * Fixes casing issues with know audiences.
 *
 * @param {string} audience audience string
 */
export const cleanKnownAudience = (audience: string) => {
	if (audience && audience.toLowerCase() === 'patient') {
		return 'Patient';
	}

	if (audience && audience.toLowerCase() === 'healthprofessional') {
		return 'HealthProfessional';
	}

	return audience;
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

		// Opens modal
		modal.handleModalOpen(evt);
		// Puts loading text in the modal in case the request takes time
		resetModal(modal);
		const eventTarget = evt.currentTarget as HTMLElement;

		// Create Request Object with necessary data
		const requestDataObject = {
			dictionary: glossary,
			audience,
			language,
			id: glossaryId.toString(),
		};
		getDictionaryResponseFromElement(eventTarget, modal, requestDataObject);
	};

/**
 * These glossary terms have been glossified using Drupal. They are all for the Dictionary of
 * Cancer Terms and they all match the pattern like:
 *
 * <a class="definition" data-glossary-id="CDR0000046014" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046014&amp;version=Patient&amp;language=English">malnutrition</a>
 */
export const addListenersToDrupalGlossaryTerms = (
	modal: USAModal,
	selector: string = DEFINITION_LINK_SELECTORS.DRUPAL_TERMS
) => {
	// Find all links that are identifiable as CKEditor-glossified links. Otherwise exit.
	const glossaryLinks = document.querySelectorAll(selector);
	if (!glossaryLinks.length) return;

	glossaryLinks.forEach((glossaryLink) => {
		// Extract the data- params
		const element = glossaryLink as HTMLElement;
		const glossaryId = cleanId(element.dataset.glossaryId as string);
		const { glossary, audience } = getParamsOrDefaults(
			element.dataset.glossaryName as string,
			cleanKnownAudience(element.dataset.glossaryAudience as string)
		);
		glossaryLink.removeAttribute('onclick');
		glossaryLink.addEventListener(
			'click',
			definitionClickHandler(
				glossary,
				audience,
				document.documentElement.lang || 'en',
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
export const addListenersToPdqAndLegacyGlossaryTerms = (
	modal: USAModal,
	selector: string = DEFINITION_LINK_SELECTORS.PDQ_LEGACY_TERMS
) => {
	// Find all legacy links. Otherwise exit.
	// (Unfortunately this will run on every page for the time being, so we want to avoid resource-intensive operations
	// beyond the initial DOM query.)
	const glossaryLinks = document.querySelectorAll(selector);
	if (!glossaryLinks.length) return;

	glossaryLinks.forEach((element) => {
		// Get the query params from the href
		const basePath = 'https://www.cancer.gov';
		const urlString = basePath + element.getAttribute('href');

		const urlParams = new URL(urlString);
		const params: Record<string, string> = {};
		urlParams.searchParams.forEach((value, parameter) => {
			params[parameter] = value;
		});

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
				document.documentElement.lang || 'en',
				glossaryId,
				modal
			)
		);
	});
};
