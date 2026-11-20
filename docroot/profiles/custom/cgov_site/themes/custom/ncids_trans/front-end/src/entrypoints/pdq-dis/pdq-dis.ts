import './pdq-dis.scss';

import cgdpArticleBodyInit from '../../lib/components/cgdp-article-body';
import cgdpDefinitionInit from '../../lib/components/cgdp-definition';
import cgdpRelatedResourcesInit from '../../lib/components/cgdp-related-resources';

declare global {
	/** This is the general CDE Configuration Information. */
	interface CDEConfig_General {
		/** This is the media server URL. */
		mediaServer: string;
	}

	/** This is our configuration object that Drupal places in the head. */
	interface CDEConfig {
		/** This is the general page information. */
		general: CDEConfig_General;
	}
}

const onDOMContentLoaded = () => {
	initializePdqAudio();
	cgdpArticleBodyInit();
	cgdpDefinitionInit(true);
	cgdpRelatedResourcesInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

// Find pronunciation blocks on the page and wire up their auidio playback.
const initializePdqAudio = () => {
	const server = window.CDEConfig?.general?.mediaServer;

	if (!server) return;

	const pronunciations = document.querySelectorAll<HTMLElement>(
		'[data-pdq-pronunciation]'
	);

	pronunciations.forEach((pronunciation) => {
		const audioEl =
			pronunciation.querySelector<HTMLAudioElement>('[data-pdq-audio]');
		const buttonEl = pronunciation.querySelector<HTMLButtonElement>(
			'[data-pdq-audio-trigger]'
		);

		const audioId =
			audioEl?.dataset.pdqAudioId?.replace(/^CDR0+/i, '').replace(/\D/g, '') ??
			'';

		if (!audioEl || !buttonEl || !audioId) return;

		audioEl.src = `${server}/pdq/media/audio/${audioId}.mp3`;
		buttonEl.addEventListener('click', () => {
			audioEl.currentTime = 0;
			audioEl.play().catch((error) => {
				console.error('Unable to play PDQ pronunciation audio.', error);
			});
		});
	});
};
