import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import sidenavInit from '../usa-sidenav';
import {
	deepTreeNav,
	currentIsRoot,
	currentUrlNotInNav,
} from './usa-sidenav.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('usa-sidenav', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	describe('"Normal nav scenarios"', () => {
		it('sends analytics when immediate parent navigation item clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', deepTreeNav);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('Clinical Trials Information', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Clinical Trials Information',
					location: 'SideNav',
					listNumber: 4,
					clickedLevel: 'L2',
					activeLevel: 'L3',
					sideNavHeading: 'Cancer Treatment',
				}
			);
		});

		it('sends analytics when a higher navigation item clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', deepTreeNav);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('Types of Cancer Treatment', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Types of Cancer Treatment',
					location: 'SideNav',
					listNumber: 2,
					clickedLevel: 'L2',
					activeLevel: 'L3',
					sideNavHeading: 'Cancer Treatment',
				}
			);
		});

		it('sends analytics when a child item is clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', deepTreeNav);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText(
				'Insurance Coverage and Clinical Trials',
				{
					selector: 'a',
				}
			);

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Insurance Coverage and Clinical Trials',
					location: 'SideNav',
					listNumber: 8,
					clickedLevel: 'L4',
					activeLevel: 'L3',
					sideNavHeading: 'Cancer Treatment',
				}
			);
		});

		it('sends analytics when the same item is clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', deepTreeNav);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('Paying for Clinical Trials', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Paying for Clinical Trials',
					location: 'SideNav',
					listNumber: 7,
					clickedLevel: 'L3',
					activeLevel: 'L3',
					sideNavHeading: 'Cancer Treatment',
				}
			);
		});
	});

	describe('current url not in navigation', () => {
		it('sends analytics when a another navigation item clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', currentUrlNotInNav);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('Types of Cancer Treatment', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Types of Cancer Treatment',
					location: 'SideNav',
					listNumber: 2,
					clickedLevel: 'L2',
					activeLevel: 'L2',
					sideNavHeading: 'Cancer Treatment',
				}
			);
		});

		it('sends analytics when immediate parent (e.g. the deepest usa-current) navigation item clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', currentUrlNotInNav);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('Side Effects of Cancer Treatment', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Side Effects of Cancer Treatment',
					location: 'SideNav',
					listNumber: 3,
					clickedLevel: 'L2',
					activeLevel: 'L2',
					sideNavHeading: 'Cancer Treatment',
				}
			);
		});
	});

	describe('current url is the root of the tree', () => {
		it('sends analytics when a child item is clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', currentIsRoot);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('Intramural Research', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'Intramural Research',
					location: 'SideNav',
					listNumber: 2,
					clickedLevel: 'L2',
					activeLevel: 'L1',
					sideNavHeading: 'NCI’s Role in Cancer Research',
				}
			);
		});

		it('sends analytics when the same item is clicked', async () => {
			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', currentIsRoot);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('NCI’s Role in Cancer Research', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'NCI’s Role in Cancer Research',
					location: 'SideNav',
					listNumber: 1,
					clickedLevel: 'L1',
					activeLevel: 'L1',
					sideNavHeading: 'NCI’s Role in Cancer Research',
				}
			);
		});
	});

	describe('error cases', () => {
		it('does not blow up if there is no sidenav', async () => {
			const noSideNavMarkup = `
				<div>There is no side nav</div>
			`;

			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', noSideNavMarkup);

			// Create the banner JS
			sidenavInit();

			expect(spy).not.toHaveBeenCalled();
		});

		// This test case is really to handle some of the error message stuff
		// for conditions that cannot happen with the click handler and
		// valid HTML, but would be unchecked conditions.
		it('half works with error messages for stupid HTML', async () => {
			const noSideNavMarkup = `
				<ul class="usa-sidenav usa-sidenav--nci-sidenav">
					<a href="#">link for bad html</a>
				</ul>
			`;

			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', noSideNavMarkup);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('link for bad html', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'link for bad html',
					location: 'SideNav',
					listNumber: 1,
					clickedLevel: 'L1',
					activeLevel: 'L0',
					sideNavHeading: '_ERROR_',
				}
			);
		});
		it('half works with error messages for stupid HTML pt2', async () => {
			const noSideNavMarkup = `
				<ul class="usa-sidenav usa-sidenav--nci-sidenav">
					<li>chicken</li>
					<a href="#">link for bad html</a>
				</ul>
			`;

			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', noSideNavMarkup);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('link for bad html', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'link for bad html',
					location: 'SideNav',
					listNumber: 1,
					clickedLevel: 'L1',
					activeLevel: 'L0',
					sideNavHeading: '_ERROR_',
				}
			);
		});
		it('half works with error messages for empty anchor as title', async () => {
			const noSideNavMarkup = `
				<ul class="usa-sidenav usa-sidenav--nci-sidenav">
					<li><a href="#"></a></li>
					<a href="#">link for bad html</a>
				</ul>
			`;

			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', noSideNavMarkup);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByText('link for bad html', {
				selector: 'a',
			});

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: 'link for bad html',
					location: 'SideNav',
					listNumber: 2,
					clickedLevel: 'L1',
					activeLevel: 'L0',
					sideNavHeading: '_ERROR_',
				}
			);
		});
		it('half works with error messages for empty clicked thing', async () => {
			const noSideNavMarkup = `
				<ul class="usa-sidenav usa-sidenav--nci-sidenav">
					<a href="#"></a>
				</ul>
			`;

			// Lets make a spy to ensure that trackOther is called correctly
			const spy = jest.spyOn(eddlUtil, 'trackOther');

			// Inject the HTML into the dom.
			document.body.insertAdjacentHTML('beforeend', noSideNavMarkup);

			// Create the banner JS
			sidenavInit();

			const link = await screen.findByRole('link');

			// Click the link
			fireEvent.click(link);

			expect(spy).toHaveBeenCalledWith(
				'SideNav:LinkClick',
				'SideNav:LinkClick',
				{
					linkText: '_ERROR_',
					location: 'SideNav',
					listNumber: 1,
					clickedLevel: 'L1',
					activeLevel: 'L0',
					sideNavHeading: '_ERROR_',
				}
			);
		});
	});
});
