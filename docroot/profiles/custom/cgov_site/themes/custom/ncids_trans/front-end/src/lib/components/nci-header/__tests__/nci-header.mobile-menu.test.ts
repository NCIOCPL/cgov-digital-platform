import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import headerInit from '../nci-header';
import { headerWithDataMenuId } from './nci-header.mega-menu.dom';

import * as nock from 'nock';

jest.mock('../../../core/analytics/eddl-util');

describe('nci-header - mobile menu analytics', () => {
	beforeEach(() => {
		// matchMedia not available in JSDOM
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation((query) => ({
				matches: query === '(min-width: 480px)',
				media: query,
				onchange: null,
				addListener: jest.fn(), // Deprecated
				removeListener: jest.fn(), // Deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			})),
		});

		// Resize
		global.innerWidth = 400;
		window.dispatchEvent(new Event('resize'));
	});

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	afterAll(() => {
		nock.cleanAll();
		nock.enableNetConnect();
		jest.restoreAllMocks();
	});

	// Mock stub out mobile menu stuff so tests don't break.
	window.ncidsNavInfo = {
		nav: { id: '1500002', menu_type: 'section-nav' },
		item_id: '1500005',
	};

	it('open mobile menu', async () => {
		// Add the header to the body
		const spy = jest.spyOn(eddlUtil, 'trackOther');
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(
				200,
				__dirname +
					'/../cgdp-mobile-menu/__tests__/data/section-nav/1500002.json'
			);

		const container = headerWithDataMenuId();
		document.body.append(container);

		// Init the header
		headerInit();
		// Open the menu
		const button = await screen.findByText('Menu');
		fireEvent.click(button);

		// Link Click
		await screen.findByText('Back');

		expect(spy).toHaveBeenCalledWith(
			'MobilePrimaryNav:Open',
			'MobilePrimaryNav:Open',
			{
				action: 'Open',
				location: 'MobilePrimaryNav',
			}
		);

		scope.isDone();
	});

	it('link click test', async () => {
		// Add the header to the body
		const spy = jest.spyOn(eddlUtil, 'trackOther');
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(
				200,
				__dirname +
					'/../cgdp-mobile-menu/__tests__/data/section-nav/1500002.json'
			);

		const container = headerWithDataMenuId();
		document.body.append(container);

		// Init the header
		headerInit();
		// Open the menu, trigger the open event
		const button = await screen.findByText('Menu');
		fireEvent.click(button);

		// Look for the back button to ensure that the menu has been opened
		const backBtn = await screen.findByText('Back');

		// Click the back button to trigger link click event
		fireEvent.click(backBtn);

		// Look for Explore A.1.1.1 to ensure that the next level has been displayed
		// (thus waiting for the link click event on the back button to be fired)
		const childPage = await screen.findByText('A.1.1.1.1');
		fireEvent.click(childPage);

		// Click on the explore page, which should close the menu
		const explorePage = await screen.findByText('Explore A.1.1.1.1');
		fireEvent.click(explorePage);
		await screen.findByText('Menu');

		expect(spy).toHaveBeenNthCalledWith(
			1,
			'MobilePrimaryNav:Open',
			'MobilePrimaryNav:Open',
			{
				action: 'Open',
				location: 'MobilePrimaryNav',
			}
		);
		expect(spy).toHaveBeenNthCalledWith(
			2,
			'MobilePrimaryNav:LinkClick',
			'MobilePrimaryNav:LinkClick',
			{
				linkText: 'Back',
				location: 'MobilePrimaryNav',
				action: 'Back',
				listNumber: null,
			}
		);
		expect(spy).toHaveBeenNthCalledWith(
			3,
			'MobilePrimaryNav:LinkClick',
			'MobilePrimaryNav:LinkClick',
			{
				linkText: 'A.1.1.1.1',
				location: 'MobilePrimaryNav',
				action: 'ChildPageMenu',
				listNumber: 2,
			}
		);
		expect(spy).toHaveBeenNthCalledWith(
			4,
			'MobilePrimaryNav:LinkClick',
			'MobilePrimaryNav:LinkClick',
			{
				linkText: 'Explore A.1.1.1.1',
				location: 'MobilePrimaryNav',
				action: 'ExplorePage',
				listNumber: 1,
			}
		);

		scope.isDone();
	});

	it('Close menu with overlay click', async () => {
		// Add the header to the body
		const spy = jest.spyOn(eddlUtil, 'trackOther');
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(
				200,
				__dirname +
					'/../cgdp-mobile-menu/__tests__/data/section-nav/1500002.json'
			);

		const container = headerWithDataMenuId();
		document.body.append(container);

		// Init the header
		headerInit();
		// Open the menu
		const button = await screen.findByText('Menu');
		fireEvent.click(button);

		await screen.findByText('Back');

		// Click overlay to close menu
		const overlay = await container.getElementsByClassName(
			'nci-header-mobilenav__overlay'
		);
		fireEvent.click(overlay[0]);

		expect(spy).toHaveBeenCalledWith(
			'MobilePrimaryNav:Close',
			'MobilePrimaryNav:Close',
			{
				action: 'CloseClickAway',
				location: 'MobilePrimaryNav',
			}
		);
		scope.isDone();
	});

	it('Close menu with X click', async () => {
		// Add the header to the body
		const spy = jest.spyOn(eddlUtil, 'trackOther');
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(
				200,
				__dirname +
					'/../cgdp-mobile-menu/__tests__/data/section-nav/1500002.json'
			);

		const container = headerWithDataMenuId();
		document.body.append(container);

		// Init the header
		headerInit();
		// Open the menu
		const button = await screen.findByText('Menu');
		fireEvent.click(button);

		await screen.findByText('Back');

		// Click overlay to close menu
		const closeBtn = await container.getElementsByClassName(
			'nci-header-mobilenav__close-btn'
		);
		fireEvent.click(closeBtn[0]);

		expect(spy).toHaveBeenCalledWith(
			'MobilePrimaryNav:Close',
			'MobilePrimaryNav:Close',
			{
				action: 'CloseX',
				location: 'MobilePrimaryNav',
			}
		);

		scope.isDone();
	});

	it('Close menu with Escape key click', async () => {
		// Add the header to the body
		const user = userEvent.setup();
		const spy = jest.spyOn(eddlUtil, 'trackOther');
		const scope = nock('http://localhost')
			.get('/taxonomy/term/1500002/section-nav')
			.once()
			.replyWithFile(
				200,
				__dirname +
					'/../cgdp-mobile-menu/__tests__/data/section-nav/1500002.json'
			);

		const container = headerWithDataMenuId();
		document.body.append(container);

		// Init the header
		headerInit();
		// Open the menu
		const button = await screen.findByText('Menu');
		fireEvent.click(button);

		await screen.findByText('Back');

		// Click overlay to close menu
		await user.keyboard('{Escape}');

		expect(spy).toHaveBeenCalledWith(
			'MobilePrimaryNav:Close',
			'MobilePrimaryNav:Close',
			{
				action: 'CloseEsc',
				location: 'MobilePrimaryNav',
			}
		);

		scope.isDone();
	});
});
