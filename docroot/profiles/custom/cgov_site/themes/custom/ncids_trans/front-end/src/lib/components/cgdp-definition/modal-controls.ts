import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { getTermById } from '../../services/glossary-api-client-v1';
import getModalContentSnippet from './modal-content-snippet';
import {
	dictionaryPopupAnalytics,
	getDictionaryRequestParameters,
} from './cgdp-definition';

/**
 * Simple function to put loading text / gif into the modal
 * while the request is ongoing
 * @param modal the modal to be updated
 */
export const resetModal = (modal: USAModal) => {
	modal.updateDialog({
		title: undefined,
		content: 'Loading Definition....',
	});
};

// Data Type for Data Request Object
// This comes from legacy definition links that
// have their data cleaned up via helper functions
type DefinitionRequestDataObject = {
	dictionary: string;
	audience: string;
	language: string;
	id: string;
};

/**
 * Fetches the dictionary response via the HTML Element attributes
 * @param eventTarget the dictionary HTML Element being clicked
 * @param modal the modal popup
 * @param data an optional parameter for data that has been "cleaned" (legacy junk)
 */
export const getDictionaryResponseFromElement = async (
	eventTarget: HTMLElement,
	modal: USAModal,
	data?: DefinitionRequestDataObject
) => {
	const { dictionary, audience, language, id } = !data
		? getDictionaryRequestParameters(eventTarget)
		: data;
	try {
		const response = await getTermById(dictionary, audience, language, id);
		// Update modal content with content from our fetch request

		// Check for pronunciation term / audio
		const pronunciationTerm = response?.pronunciation?.key || '';
		const audioUrl = response?.pronunciation?.audio || '';

		modal.updateDialog({
			title: undefined,
			content: getModalContentSnippet(
				response.termName,
				pronunciationTerm,
				audioUrl,
				response.definition.html,
				response.media
			),
		});
		dictionaryPopupAnalytics(true, eventTarget, parseInt(id));
	} catch (e) {
		// Update modal content with an error message that the request failed
		modal.updateDialog({
			title: undefined,
			content: `<div>Error Fetching Dictionary Data:</div>${e as string}`,
		});
		dictionaryPopupAnalytics(false, eventTarget, parseInt(id));
	}
};
