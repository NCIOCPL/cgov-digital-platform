import {
	addListenersToDrupalGlossaryTerms,
	addListenersToPdqAndLegacyGlossaryTerms,
} from './cgdp-definition-legacy-helpers';

import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { resetModal, getDictionaryResponseFromElement } from './modal-controls';

import { trackOther } from '../../core/analytics/eddl-util';

// The selectors for definition links, current and legacy
// Keeping them as constants for posterity
export const DEFINITION_LINK_SELECTORS = {
	CGDP_TERMS: '.cgdp-definition-link, a[data-gloss-id]',
	DRUPAL_TERMS: 'a.definition[data-glossary-id]',
	PDQ_LEGACY_TERMS: `a.definition[href*="popDefinition.aspx"]:not([data-glossary-id]),${' '}
		a[onclick*="javascript:popWindow('defbyid'"]`,
};

/**
 * Gets the parameters for the request from the HMTLElement
 * @param targetElement The HTMLElement with the necessary attributes
 * @returns An object of the required parameters for the fetch call
 */
export const getDictionaryRequestParameters = (targetElement: HTMLElement) => {
	const requestParameters = {
		dictionary: targetElement.dataset.glossDictionary as string,
		audience: targetElement.dataset.glossAudience as string,
		language: targetElement.dataset.glossLang as string,
		id: targetElement.dataset.glossId as string,
	};
	return requestParameters;
};

// Get all of the definition links on the page
// so we can get the index of the one clicked for analytics
const getAllDefinitionLinks = () => {
	const allDefinitionLinks = Array.from(
		document.querySelectorAll(
			`${DEFINITION_LINK_SELECTORS.CGDP_TERMS}${', '}
			${DEFINITION_LINK_SELECTORS.DRUPAL_TERMS}${', '}
			${DEFINITION_LINK_SELECTORS.PDQ_LEGACY_TERMS}`
		)
	);
	return allDefinitionLinks;
};

/**
 *
 * @param success boolean for whether the request was successful
 * @param definitionLink the link being clicked for a popup definition
 */
export const dictionaryPopupAnalytics = (
	success: boolean,
	definitionLink: HTMLElement,
	termID: number
) => {
	// Get necessary analytics data from element
	const linkText = (definitionLink.textContent || '').trim().slice(0, 50);
	const linkArray = getAllDefinitionLinks();
	const totalLinks = linkArray.length;
	const linkPosition = linkArray.indexOf(definitionLink) + 1;
	const analyticsEventName = success
		? 'Body:Glossified:PopupLoad'
		: 'Body:Glossified:PopupError';
	const linkType = success ? 'Glossary Load' : 'Glossary Error';

	trackOther(analyticsEventName, analyticsEventName, {
		location: 'Body',
		componentType: 'Glossified Link',
		linkType,
		linkText,
		totalLinks,
		linkPosition,
		termID,
	});
};

/**
 * The function for handling the click of a definition term
 * The function takes the modal in as a parameter, and initiates a fetch
 * request to get the term's definition and other data
 * Populates the modal on success, including initializing an audio player
 * @param modal the modal on the page being used for definitions
 */
export const definitionClickHandler =
	(modal: USAModal) => async (evt: Event) => {
		evt.preventDefault();

		// Opens modal
		modal.handleModalOpen(evt);
		// Puts loading text in the modal in case the request takes time
		resetModal(modal);

		const eventTarget = evt.currentTarget as HTMLElement;
		getDictionaryResponseFromElement(eventTarget, modal);
	};

// This should apply to new cgdp-definition-links as well as previous
// NCI definition links (from old glossaryPopups)
const addListenersToDefinitionTerms = (
	modal: USAModal,
	selector: string = DEFINITION_LINK_SELECTORS.CGDP_TERMS
) => {
	const links = document.querySelectorAll(selector);
	if (!links) return;
	links.forEach((link) => {
		link.addEventListener('click', definitionClickHandler(modal));
	});
};

/**
 * Wires up the definition links for the cdgp requirements.
 */
const initialize = () => {
	// The config for the modal
	const modalConfig = {
		id: 'modal-callback',
		forced: false,
		modifier: 'usa-modal--nci-maxh',
		title: 'some example',
	};
	const modal = USAModal.createConfig(modalConfig);
	addListenersToDefinitionTerms(modal);
	addListenersToDrupalGlossaryTerms(modal);
	addListenersToPdqAndLegacyGlossaryTerms(modal);
};

export default initialize;
