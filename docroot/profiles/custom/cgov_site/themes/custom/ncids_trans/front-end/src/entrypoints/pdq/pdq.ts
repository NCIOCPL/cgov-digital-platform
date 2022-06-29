import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import './pdq.scss';
import './pdq-legacy.scss';

declare global {
	/** This is the general CDE Configuration Information */
	interface CDEConfig_General {
		/** This is the media server url */
		mediaServer: string;
	}
	/** This is our configuration object that Drupal places in the head for various apis. */
	interface CDEConfig {
		/** This is the general page information. */
		general: CDEConfig_General;
	}
}

const onDOMContentLoaded = () => {
	// move health professional/patient toggle up to article head
	moveToggle();

	buildAudioLinks();

	citAnchorLinks();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/* TODO: create a field in the content type for 'hp-patient-toggle-link' */
const moveToggle = () => {
	const toggle = document.querySelector('#cgvBody .pdq-hp-patient-toggle');
	if (toggle) {
		// Updating as #main goes away in NCIDS.
		const pageTitle = document.querySelector('main h1');
		pageTitle?.insertAdjacentElement('afterend', toggle);
	}
};

// fix citation anchor links
// if you see console errors that say something like: '#section_1.3 h2' is not a valid selector, they're coming from analytics.
const citAnchorLinks = () => {
	document.getElementById('cgvBody')?.addEventListener('click', (e) => {
		const anchor = e.target as HTMLAnchorElement;
		if (anchor === null) return;

		if (anchor.hash && anchor.hash.match('#cit/')) {
			e.preventDefault();
			const newLocation = anchor.hash.replace('#cit/', '');
			window.location.hash = newLocation;
		}
	});
};

const buildAudioLinks = () => {
	const audioEl = document.querySelectorAll(
		'[templatename="pdqSnMediaAudioPlayer"]'
	)[0];
	const audioId = audioEl
		? audioEl.getAttribute('objectid')?.replace(/^CDR0+/i, '')
		: false;

	if (audioId) {
		const server = window.CDEConfig?.general?.mediaServer;
		if (server && audioEl.parentElement) {
			const audioPath = server + '/pdq/media/audio/' + audioId + '.mp3';
			const audioPronunciation = audioEl.parentElement.textContent?.replace(
				'Placeholder slot\n',
				''
			);

			audioEl.parentElement.innerHTML =
				'<a href="' +
				audioPath +
				'" class="CDR_audiofile"><span class="show-for-sr">listen</span></a>' +
				audioPronunciation;

			// The audioplayer setup is called only once on page load, so we need to
			// initialize it again for audiolinks added dynamically, but scoped to only the
			// new element to avoid potential duplication on existing elements.
			linkAudioPlayer('.pdqdruginfosummary .CDR_audiofile');
		}
	}
};
