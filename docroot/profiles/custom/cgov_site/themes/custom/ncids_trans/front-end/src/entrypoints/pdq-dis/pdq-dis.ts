import './pdq-dis-legacy.scss';
import './pdq-dis.scss';

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
	citAnchorLinks();
	cgdpRelatedResourcesInit();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

// Fix citation anchor links. Slashes in the original fragment can cause
// analytics code to treat the fragment as an invalid selector.
const citAnchorLinks = () => {
	document.getElementById('cgvBody')?.addEventListener('click', (event) => {
		const anchor = event.target as HTMLAnchorElement;
		if (anchor?.hash?.match('#cit/')) {
			event.preventDefault();
			window.location.hash = anchor.hash.replace('#cit/', '');
		}
	});
};

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
