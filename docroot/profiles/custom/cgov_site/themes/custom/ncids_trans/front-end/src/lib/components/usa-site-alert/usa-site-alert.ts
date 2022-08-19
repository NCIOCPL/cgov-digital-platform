import { trackOther } from '../../core/analytics/eddl-util';

import { NCISiteAlert } from '@nciocpl/ncids-js';

/**
 * Tracks analytics using eddlUtil for site alert.
 * @param linkText Text of the link clicked.
 * @param preHeaderElement Either standard or slim alert.
 * @param action Either Link Click, Minimize, Expand, or Dismiss.
 */
const track = (linkText: string, preHeaderElement: string, action: string) => {
	trackOther('PreHeader:LinkClick', 'PreHeader:LinkClick', {
		linkText: linkText,
		location: 'PreHeader',
		action: action,
		preHeaderElement: preHeaderElement,
	});
};

/**
 * Event handler for standard alert expand.
 */
const expandClickHandler: EventListener = () => {
	track('Expand', 'Standard Alert', 'Expand');
};

/**
 * Event handler for standard alert minimize.
 */
const minimizeClickHandler: EventListener = () => {
	track('Minimize', 'Standard Alert', 'Minimize');
};

/**
 * Event handler for standard and slim alert dismiss.
 * @param evt User event when close button is clicked.
 */
const dismissClickHandler: EventListener = (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;
	const preHeaderElement = target.classList;
	const el = preHeaderElement.contains('usa-site-alert--nci-slim')
		? 'Slim Alert'
		: 'Standard Alert';
	track('Dismiss', el, 'Dismiss');
};

/**
 * Event handler for standard and slim alert link clicks.
 * @param evt User event when link is clicked.
 */
const linkClickHandler: EventListener = (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;
	const linkText = (target.textContent as string).trim() || '_ERROR_';
	const preHeaderElement = (target.closest('section') as HTMLElement).classList;
	const el = preHeaderElement.contains('usa-site-alert--nci-slim')
		? 'Slim Alert'
		: 'Standard Alert';
	track(linkText, el, 'Link Click');
};

/**
 * Wires up a use-site-alert for the cdgp requirements.
 */
const initialize = () => {
	const usaAlerts = document.querySelectorAll('.usa-site-alert');
	if (usaAlerts && usaAlerts.length === 0) return;

	usaAlerts.forEach((element: Node) => {
		const alert = element as HTMLElement;
		const closeable = alert.dataset.siteAlertClosable?.toLowerCase() === 'true';
		NCISiteAlert.create(alert, { closeable });

		alert.addEventListener('usa-site-alert:content:expand', expandClickHandler);

		alert.addEventListener(
			'usa-site-alert:content:collapse',
			minimizeClickHandler
		);

		alert.addEventListener(
			'usa-site-alert:close-button:close',
			dismissClickHandler
		);
	});

	const links = document.querySelectorAll('.usa-site-alert .usa-link');
	links.forEach((link: Node) => {
		link.addEventListener('click', linkClickHandler);
	});
};

export default initialize;
