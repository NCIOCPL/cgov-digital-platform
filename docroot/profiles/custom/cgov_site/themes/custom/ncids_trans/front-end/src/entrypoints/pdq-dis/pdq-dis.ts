import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import './pdq-dis-legacy.scss';
import './pdq-dis.scss';

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
	buildAudioLinks();
	citAnchorLinks();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

const buildAudioLinks = () => {
	const audioEl = document.querySelector(
		'[templatename="pdqSnMediaAudioPlayer"]'
	);
	const audioId = audioEl?.getAttribute('objectid')?.replace(/^CDR0+/i, '');

	const server = window.CDEConfig?.general?.mediaServer;
	if (!audioId || !server || !audioEl?.parentElement) return;

	const audioPath = `${server}/pdq/media/audio/${audioId}.mp3`;
	const audioPronunciation = audioEl.parentElement.textContent?.replace(
		'Placeholder slot\n',
		''
	);

	audioEl.parentElement.innerHTML =
		`<a href="${audioPath}" class="CDR_audiofile">` +
		'<span class="show-for-sr">listen</span></a>' +
		audioPronunciation;

	// The global audio-player setup has already run, so initialize only the
	// dynamically generated PDQ link.
	linkAudioPlayer('.pdqdruginfosummary .CDR_audiofile');
};

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
