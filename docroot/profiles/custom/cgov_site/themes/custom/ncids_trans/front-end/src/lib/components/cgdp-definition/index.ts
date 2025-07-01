// import { trackOther } from '../../core/analytics/eddl-util';
import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { resetModal, getDictionaryResponseFromElement } from './modal-controls';
import {
	addListenersToDrupalGlossaryTerms,
	addListenersToPdqAndLegacyGlossaryTerms,
} from './cgdp-definition-legacy-helpers';

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
		// Puts loading text in the modal in case the request takes time
		resetModal(modal);
		modal.handleModalOpen(evt);
		const eventTarget = evt.currentTarget as HTMLElement;
		if (!eventTarget) throw new Error('Event Target is null or undefined');
		getDictionaryResponseFromElement(eventTarget, modal);
	};

// This should apply to new cgdp-definition-links as well as previous
// NCI definition links (from old glossaryPopups)
const addListenersToDefinitionTerms = (modal: USAModal, selector: string) => {
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
	addListenersToDefinitionTerms(
		modal,
		'.cgdp-definition-link, a[data-gloss-id]'
	);
	addListenersToDrupalGlossaryTerms(modal);
	addListenersToPdqAndLegacyGlossaryTerms(modal);
};

export default initialize;
