import './pdq-cis-legacy.scss';
import './pdq-cis.scss';

const onDOMContentLoaded = () => {
	moveToggle();
	citAnchorLinks();
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/* TODO: create a field in the content type for 'hp-patient-toggle-link' */
const moveToggle = () => {
	const toggle = document.querySelector('#cgvBody .pdq-hp-patient-toggle');
	if (toggle) {
		const pageTitle = document.querySelector('main h1');
		pageTitle?.insertAdjacentElement('afterend', toggle);
	}
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
