import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import cgdpProfileBox from '../cgdp-profile-box';
import { cgdpProfileBoxBiographyDom } from './cgdp-profile-box.biography.dom';
import { cgdpProfileBoxCancerCenterDom } from './cgdp-profile-box.cancer-center.dom';

jest.mock('../../../core/analytics/eddl-util');

describe('NCIDS Profile Box', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends analytics for email links', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpProfileBoxBiographyDom);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('loukissj@mail.nih.gov');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Biography',
				profileBoxTitle: 'Jennifer K. Loukissas, M.P.P.',
				profileField: 'Email Address',
				linkType: 'Email',
			}
		);
	});

	it('sends analytics for twitter links', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpProfileBoxBiographyDom);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('Follow me on X');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Biography',
				profileBoxTitle: 'Jennifer K. Loukissas, M.P.P.',
				profileField: 'Twitter Profile Handle',
				linkType: 'External',
			}
		);
	});

	it('sends analytics for linkedin links', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpProfileBoxBiographyDom);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('Connect with me on LinkedIn');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Biography',
				profileBoxTitle: 'Jennifer K. Loukissas, M.P.P.',
				profileField: 'LinkedIn Profile Handle',
				linkType: 'External',
			}
		);
	});

	it('sends analytics for publications links', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', cgdpProfileBoxBiographyDom);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('Scientific Publications');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Biography',
				profileBoxTitle: 'Jennifer K. Loukissas, M.P.P.',
				profileField: 'Publications',
				linkType: 'External',
			}
		);
	});

	it('sends analytics for website links', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpProfileBoxCancerCenterDom
		);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('Visit Website');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Cancer Center',
				profileBoxTitle: 'Duke Cancer Center',
				profileField: 'Website',
				linkType: 'Internal',
			}
		);
	});

	it('sends analytics for Other links', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpProfileBoxCancerCenterDom
		);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('1-888-275-3853');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Cancer Center',
				profileBoxTitle: 'Duke Cancer Center',
				profileField: 'Other',
				linkType: 'Other',
			}
		);
	});

	it('check for missing heading', async () => {
		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML(
			'beforeend',
			cgdpProfileBoxCancerCenterDom
		);

		// Create the JS
		cgdpProfileBox();

		// Get links
		const link = screen.getByText('1-888-275-3853');
		const heading = screen.getByText('Duke Cancer Center');
		heading.remove();

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'Inner:ProfileBox:LinkClick',
			'Inner:ProfileBox:LinkClick',
			{
				location: 'Body',
				componentType: 'Profile Box',
				profileBoxType: 'Cancer Center',
				profileBoxTitle: '_ERROR_',
				profileField: 'Other',
				linkType: 'Other',
			}
		);
	});

	it('does not blow up when profile box does not exist', () => {
		const html = `<div></div>`;

		// Let's make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', html);

		// Create the JS
		cgdpProfileBox();

		expect(spy).not.toHaveBeenCalled();
	});
});
