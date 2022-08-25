import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Tracks a language toggle click.
 * @param linkText The language of the link.
 * @param location Location of the page options either top or bottom of page.
 */
const track = (linkText: string, location: string) => {
	trackOther('PageOptions:LinkClick', 'PageOptions:LinkClick', {
		linkText: linkText,
		location: location,
	});
};

/**
 * Click handler for the language toggle click.
 * @param evt the event.
 */
const emailClickHandler: EventListener = (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;
	const pageOptionElement = target.parentElement as HTMLElement;
	const location = pageOptionElement.classList.contains(
		'cgdp-page-options--top'
	)
		? 'BodyTop'
		: 'BodyBottom';
	track('Email', location);
};

/**
 * Click handler for the language toggle click.
 * @param evt the event.
 */
const printClickHandler: EventListener = (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;
	const pageOptionElement = target.parentElement as HTMLElement;
	const location = pageOptionElement.classList.contains(
		'cgdp-page-options--top'
	)
		? 'BodyTop'
		: 'BodyBottom';
	track('Print', location);
};

/**
 * Wires up a usa-banner/language toggle for the cdgp requirements.
 */
const initialize = () => {
	const emailButtons = document.querySelectorAll('.cgdp-page-options a');
	emailButtons.forEach((element: Node) => {
		const emailButton = element as HTMLElement;
		emailButton.addEventListener('click', emailClickHandler);
	});

	const printButtons = document.querySelectorAll('.cgdp-page-options button');
	printButtons.forEach((element: Node) => {
		const printButton = element as HTMLElement;
		printButton.addEventListener('click', printClickHandler);
	});
};

export default initialize;
