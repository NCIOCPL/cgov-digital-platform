import { NCIBigFooter } from '@nciocpl/ncids-js';

import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Tracks link click.
 * @param eventName Event name and link name.
 * @param linkText Text of the link clicked, social aria-label, or ReturnToTop.
 * @param section Area link was clicked such as section header or ReturnToTop.
 */
const trackLinkClick = (
	eventName: string,
	linkText: string,
	section: string
) => {
	trackOther(eventName, eventName, {
		linkText,
		location: 'Footer',
		section,
	});
};

/**
 * Tracks form events.
 * @param eventName Event name and link name.
 * @param status Form submission status, such as complete or error.
 */
const trackForm = (eventName: string, status: string) => {
	trackOther(eventName, eventName, {
		formType: 'EmailSignUp',
		status,
		location: 'Footer',
	});
};

/**
 * Returns the link text or title text from the clicked link.
 * @param event Click link event.
 */
const getLinkText = (event: Event): string => {
	const target = event.currentTarget as HTMLAnchorElement;
	const targetTextContent = target.textContent as string;
	const errorMsg = '_ERROR_';

	return targetTextContent.trim() || errorMsg;
};

/**
 * Returns the section heading from the clicked link.
 * @param event Click link event.
 */
const getSectionText = (event: Event): string => {
	const target = event.currentTarget as HTMLAnchorElement;
	const parentElement = target.parentElement as HTMLElement;
	const grandparentElement = parentElement.parentElement as HTMLElement;
	const errorMsg = '_ERROR_';

	// Return 'OrganizationArea' if address link clicked
	if (parentElement.matches('address')) {
		return 'OrganizationArea';
	}

	// Return collapse heading if secondary navigation link clicked
	if (parentElement.classList.contains('usa-footer__secondary-link')) {
		const section = target.closest('section') as HTMLElement;
		const sectionChild =
			(<HTMLElement>section.firstElementChild).firstElementChild ||
			<HTMLElement>section.firstElementChild;
		return sectionChild.textContent || errorMsg;
	}

	// Return heading of contact info if link clicked
	if (grandparentElement.classList.contains('usa-footer__contact-info')) {
		const section = target.closest('.usa-footer__contact-links') as HTMLElement;
		const sectionFirstChild = section.firstElementChild as HTMLElement;
		return (<string>sectionFirstChild.textContent).trim() || errorMsg;
	}

	// Return heading of social media icon area if link clicked
	if (target.classList.contains('usa-social-link')) {
		const section = target.closest('.usa-footer__social-links') as HTMLElement;
		const sectionFirstChild = section.firstElementChild as HTMLElement;
		return (<string>sectionFirstChild.textContent).trim() || errorMsg;
	}

	// Otherwise return link text or error message
	return (<string>target.textContent).trim() || errorMsg;
};

/**
 * Click handler for a link click.
 */
const footerLinkAnalyticsHandler = () => (event: Event) => {
	const eventName = 'Footer:LinkClick';
	const linkText = getLinkText(event);
	const section = getSectionText(event);
	trackLinkClick(eventName, linkText, section);
};

/**
 * Click handler for collapse events.
 */
const footerCollapseAnalyticsHandler = () => (event: Event) => {
	const detail = (<CustomEvent>event).detail;
	const button = detail.querySelector(
		'button.usa-footer__primary-link'
	) as HTMLButtonElement;
	const eventName = 'Footer:SectionExpand';
	const linkText = 'Expand';
	const errorMsg = '_ERROR_';
	const section = button.textContent || errorMsg;
	trackLinkClick(eventName, linkText, section);
};

/** Make sure the start handler is only tracked on first click. */
let trackSubscribeStart = true;

/** Click handler for subscribe form email input. */
const footerSubscribeStartHandler = () => () => {
	if (!trackSubscribeStart) return;
	trackSubscribeStart = false;
	trackForm('Form:Start', 'Start');
};

/** Onsubmit handler for subscribe form. */
const footerSubscribeCompleteHandler = () => () => {
	trackForm('Form:Complete', 'Complete');
};

/** On error handler for subscribe form. */
const footerSubscribeErrorHandler = () => () => {
	trackForm('Form:Error', 'Error');
};

/**
 * Track usa-footer clicks cdgp requirements.
 */
const initialize = (): void => {
	const footerElement = document.querySelector('.usa-footer') as HTMLElement;
	if (!footerElement) return;

	if (document.documentElement.lang === 'es') {
		NCIBigFooter.create(footerElement, {
			subscribeInvalidEmailAlert: 'Ingrese su dirección de correo electrónico',
		});
	} else {
		NCIBigFooter.create(footerElement);
	}

	// All link clicks in the footer
	const navLinks = footerElement.querySelectorAll('a');
	navLinks.forEach((link) => {
		link.addEventListener('click', footerLinkAnalyticsHandler());
	});

	// Collapse expand event
	footerElement.addEventListener(
		'usa-footer:nav-links:expand',
		footerCollapseAnalyticsHandler()
	);

	// Sign up form - click event into input
	const emailInput = footerElement.querySelector(
		'input.usa-input[type=email]'
	) as HTMLInputElement;
	emailInput.addEventListener('click', footerSubscribeStartHandler());

	// Sign up form - submit event
	const form = footerElement.querySelector('form') as HTMLFormElement;
	form.addEventListener(
		'usa-footer:sign-up:submit',
		footerSubscribeCompleteHandler()
	);

	// Sign up form - sign up error
	form.addEventListener(
		'usa-footer:sign-up:error',
		footerSubscribeErrorHandler()
	);
};

export default initialize;
