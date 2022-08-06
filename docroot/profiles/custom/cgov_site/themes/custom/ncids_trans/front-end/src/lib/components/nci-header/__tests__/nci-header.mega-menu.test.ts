import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import headerInit from '../nci-header';
import { headerWithDataMenuId } from './nci-header.mega-menu.dom';

import * as nock from 'nock';

jest.mock('../../../core/analytics/eddl-util');

describe('nci-header - mega menu analytics', () => {
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

		scope.done();
	});
});
