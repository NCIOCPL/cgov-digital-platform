import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import './pdq.scss';

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
		const pageTitle = document.querySelector('#main h1');
		pageTitle.insertAdjacentElement('afterend', toggle);
	}
};

// fix citation anchor links
// if you see console errors that say something like: '#section_1.3 h2' is not a valid selector, they're coming from analytics.
const citAnchorLinks = () => {
	document.getElementById('cgvBody').addEventListener('click', (e) => {
		if (e.target.hash && e.target.hash.match('#cit/')) {
			e.preventDefault();
			const anchor = e.target.hash.replace('#cit/', '');
			window.location.hash = anchor;
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
		if (server) {
			const audioPath = server + '/pdq/media/audio/' + audioId + '.mp3';
			const audioPronunciation = audioEl.parentElement.textContent.replace(
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
