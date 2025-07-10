import { USAModal } from '@nciocpl/ncids-js/usa-modal';
import { getTermById } from '../../services/glossary-api-client-v1';
import getModalContentSnippet from './modal-content-snippet';

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

/**
 * Fetches the dictionary response via the HTML Element attributes
 * @param eventTarget the dictionary HTML Element being clicked
 * @param modal the modal popup
 */
export const getDictionaryResponseFromElement = async (
	eventTarget: HTMLElement,
	modal: USAModal
) => {
	try {
		const response = await getTermById(
			eventTarget.dataset.glossDictionary,
			eventTarget.dataset.glossAudience,
			eventTarget.dataset.glossLang,
			eventTarget.dataset.glossId
		);
		// Update modal content with content from our fetch request
		modal.updateDialog({
			title: undefined,
			content: getModalContentSnippet(
				response.prettyUrlName,
				response.pronunciation.key,
				response.pronunciation.audio,
				response.definition.html
			),
		});
		// Initialize the audio player after we get the definition data back
		// It has to happen after the fetch since it uses the audiofile we get back
		// if (!audioPlayer) {
		// 	audioPlayer = linkAudioPlayer();
		// }
	} catch (e) {
		// Update modal content with an error message that the request failed
		modal.updateDialog({
			title: undefined,
			content: `${e as string}`,
		});
	}
};

/**
 * Fetches the dictionary definition response based on data params
 * @param dictionary the dictionary / glossary term (Cancer.gov for example)
 * @param audience the audience term in the request (Patient for example)
 * @param language the language of the page
 * @param id the id of the term to search
 * @param modal the modal to open for the definition popup
 */
export const getDictionaryResponseFromData = async (
	dictionary: string,
	audience: string,
	language: string,
	id: number,
	modal: USAModal
) => {
	try {
		const response = await getTermById(
			dictionary,
			audience,
			language,
			id.toString()
		);
		// Update modal content with content from our fetch request
		modal.updateDialog({
			title: undefined,
			content: getModalContentSnippet(
				response.prettyUrlName,
				response.pronunciation.key,
				response.pronunciation.audio,
				response.definition.html
			),
		});
		// Initialize the audio player after we get the definition data back
		// It has to happen after the fetch since it uses the audiofile we get back
		// if (!audioPlayer) {
		// 	audioPlayer = linkAudioPlayer();
		// }
	} catch (e) {
		// Update modal content with an error message that the request failed
		modal.updateDialog({
			title: undefined,
			content: `${e as string}`,
		});
	}
};
