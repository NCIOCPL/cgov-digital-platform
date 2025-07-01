// import { trackOther } from '../../core/analytics/eddl-util';
import { USAModal } from '@nciocpl/ncids-js/usa-modal';

import { getTermById } from '../../services/glossary-api-client-v1';

// I was gonna use JSX for this but the modal's updateDialog function
// takes strings for title and definition
const DefinitionPronunciationSnippet = (
	term: string,
	termPronounced: string,
	audioLink: string
) => {
	const audio = `<a href="${audioLink}" class="CDR_audiofile"><span class="show-for-sr">listen</span></a>`;
	const otherthing = `<span class="pronunciation">${term} ${termPronounced} ${audio}</span>`;
	return `<div>${otherthing}</div>`;
};

export const definitionClickHandler =
	(modal: USAModal) => async (evt: Event) => {
		const eventTarget = evt.currentTarget as HTMLElement;
		if (!eventTarget) throw new Error('Event Target is null or undefined');
		const response = await getTermById(
			eventTarget.dataset.glossDictionary || '',
			eventTarget.dataset.glossAudience || '',
			eventTarget.dataset.glossLang || '',
			eventTarget.dataset.glossId || ''
		);
		modal.updateDialog({
			title: DefinitionPronunciationSnippet(
				response.prettyUrlName,
				response.pronunciation.key,
				response.pronunciation.audio
			),
			content: response.definition.html,
		});
	};

/**
 * Wires up a definition link for the cdgp requirements.
 */
const initialize = () => {
	const definitionLinks = document.querySelectorAll(
		'.cgdp-definition-link'
	) as NodeListOf<HTMLElement>;
	if (!definitionLinks.length) return;
	definitionLinks.forEach((definitionLinkElement) => {
		const modal = USAModal.create(definitionLinkElement as HTMLButtonElement);
		const definitionLink = definitionLinkElement as HTMLElement;
		definitionLink.addEventListener('click', definitionClickHandler(modal));
	});
};

export default initialize;
