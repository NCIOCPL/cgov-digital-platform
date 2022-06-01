import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Possible Languages for Language Toggle Links.
 */
enum Languages {
	/** The link text for a language toggle with the English language */
	English = 'Spanish to English',
	/** The link text for a language toggle with the Spanish language */
	Spanish = 'English to Spanish',
}

/**
 * Tracks a language toggle click.
 * @param linkText The language of the link.
 */
const track = (linkText: Languages) => {
	trackOther('PreHeader:LinkClick', 'PreHeader:LinkClick', {
		linkText,
		location: 'PreHeader',
		action: 'Link Click',
		preHeaderElement: 'Language',
	});
};

/**
 * Click handler for the language toggle click.
 * @param evt the event.
 */
const languageToggleAnalyticsHandler: EventListener = (evt: Event) => {
	const target = evt.target as HTMLElement;
	// There should always be an hreflang if we are here.
	const hreflang = target.getAttribute('hreflang');
	switch (hreflang) {
		case 'es': {
			track(Languages.Spanish);
			break;
		}
		case 'en': {
			track(Languages.English);
			break;
		}
	}
};

/**
 * Wires up a usa-banner/language toggle for the cdgp requirements.
 */
const initialize = () => {
	const languageToggles = document.querySelectorAll('#usa-banner a[hreflang]');
	languageToggles.forEach((toggle) => {
		toggle.addEventListener('click', languageToggleAnalyticsHandler);
	});
};

export default initialize;
