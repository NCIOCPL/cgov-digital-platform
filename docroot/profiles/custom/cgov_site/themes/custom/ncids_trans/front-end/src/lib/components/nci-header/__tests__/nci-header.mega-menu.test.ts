import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import headerInit from '../nci-header';
import { headerWithDataMenuId } from './nci-header.mega-menu.dom';
import { headerWithDataMenuIdBasePath } from './nci-header.mega-menu-basepath.dom';

import * as nock from 'nock';

jest.mock('../../../core/analytics/eddl-util');

describe('nci-header - mega menu analytics', () => {
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
		nav: { id: 'this_is_bogus', menu_type: 'mobile-nav' },
		item_id: 'this_too_is_bogus',
	};

	it('handles mega menu item click with base path', async () => {
		const scope = nock('http://localhost')
			.get('/nano/taxonomy/term/1234/mega-menu')
			.once()
			.replyWithFile(200, __dirname + '/data/mega-menu-content.json');

		// Add the header to the body
		document.body.appendChild(headerWithDataMenuIdBasePath());

		// Init the header
		headerInit();

		// Get the button from the primary nav.
		const primaryNavItem = await screen.findByRole('button', {
			name: 'First Section',
		});

		// Open the menu by clicking the button.
		fireEvent.click(primaryNavItem);

		const mmPrimary = await screen.findByRole('link', {
			name: 'primary label',
		});

		expect(mmPrimary).toBeInTheDocument();

		scope.done();
	});

	it('handles mega menu item clicks', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		const scope = nock('http://localhost')
			.get('/taxonomy/term/1234/mega-menu')
			.once()
			.replyWithFile(200, __dirname + '/data/mega-menu-content.json');

		// Add the header to the body
		document.body.appendChild(headerWithDataMenuId());

		// Init the header
		headerInit();

		// Get the button from the primary nav.
		const primaryNavItem = await screen.findByRole('button', {
			name: 'First Section',
		});

		// Open the menu by clicking the button.
		fireEvent.click(primaryNavItem);

		const mmPrimary = await screen.findByRole('link', {
			name: 'primary label',
		});

		fireEvent.click(mmPrimary);

		const mmListItem = await screen.findByText('L4LI2');
		fireEvent.click(mmListItem);

		const mmListHeading = await screen.findByText('list 2');
		fireEvent.click(mmListHeading);

		const pnNoMMLink = await screen.findByText('Third Section');
		fireEvent.click(pnNoMMLink);

		const logo = document.getElementsByClassName('nci-logo')[0];
		fireEvent.click(logo);

		// NOTE: You need to wait for the menu to open in order to do this
		// check. The await screen.findByText
		expect(spy).toHaveBeenNthCalledWith(
			1,
			'PrimaryNav:Open',
			'PrimaryNav:Open',
			{
				primaryNavItem: 'First Section',
				location: 'Primary Nav',
			}
		);

		expect(spy).toHaveBeenNthCalledWith(
			2,
			'PrimaryNav:LinkClick',
			'PrimaryNav:LinkClick',
			{
				location: 'Primary Nav',
				linkType: 'Primary Nav Label',
				linkText: 'primary label',
				listHeading: 'primary label',
				primaryNavItem: 'First Section',
				listHeadingNumber: 0,
				listItemNumber: 0,
			}
		);

		expect(spy).toHaveBeenNthCalledWith(
			3,
			'PrimaryNav:LinkClick',
			'PrimaryNav:LinkClick',
			{
				location: 'Primary Nav',
				linkType: 'List Item',
				linkText: 'L4LI2',
				listHeading: 'list 4',
				primaryNavItem: 'First Section',
				listHeadingNumber: 4,
				listItemNumber: 2,
			}
		);

		expect(spy).toHaveBeenNthCalledWith(
			4,
			'PrimaryNav:LinkClick',
			'PrimaryNav:LinkClick',
			{
				location: 'Primary Nav',
				linkType: 'List Heading',
				linkText: 'list 2',
				listHeading: 'list 2',
				primaryNavItem: 'First Section',
				listHeadingNumber: 2,
				listItemNumber: 0,
			}
		);

		expect(spy).toHaveBeenNthCalledWith(
			5,
			'PrimaryNav:LinkClick',
			'PrimaryNav:LinkClick',
			{
				location: 'Primary Nav',
				linkType: 'Primary Nav Button',
				linkText: 'Third Section',
				listHeading: 'Third Section',
				primaryNavItem: 'Third Section',
				listHeadingNumber: 0,
				listItemNumber: 0,
			}
		);
		expect(spy).toHaveBeenNthCalledWith(
			6,
			'Header:LinkClick',
			'Header:LinkClick',
			{
				headerLink: 'Logo',
				location: 'Header',
			}
		);

		scope.done();
	});
});
