import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';
import breadcrumbInit from '../usa-breadcrumb';

jest.mock('../../../core/analytics/eddl-util');

describe('usa-breadcrumb', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('sends analytics when link clicked', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// language=HTML
		const breadcrumbs = `
			<nav class="usa-breadcrumb usa-breadcrumb--wrap" aria-label="Wrapping Breadcrumbs Example">
				<ol class="usa-breadcrumb__list">
					<li class="usa-breadcrumb__list-item">
						<a href="example/path" class="usa-breadcrumb__link">
							<span>Home</span>
						</a>
					</li>
					<li class="usa-breadcrumb__list-item">
						<a href="example/path" class="usa-breadcrumb__link">
							<span>Federal Contracting</span>
						</a>
					</li>
					<li class="usa-breadcrumb__list-item">
						<a href="example/path" class="usa-breadcrumb__link">
							<span>Contracting assistance programs</span>
						</a>
					</li>
					<li class="usa-breadcrumb__list-item usa-current" aria-current="page">
						<span>Women-owned small business federal contracting program</span>
					</li>
				</ol>
			</nav>
		`;

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', breadcrumbs);

		// Create the banner JS
		breadcrumbInit();

		const l1 = await screen.findByRole('link', { name: 'Home' });
		fireEvent.click(l1);

		expect(spy).toHaveBeenCalledWith(
			'Breadcrumbs:LinkClick',
			'Breadcrumbs:LinkClick',
			{
				linkText: 'Home',
				location: 'Breadcrumbs',
				section: 'L1',
			}
		);

		const l2 = await screen.findByRole('link', { name: 'Federal Contracting' });
		fireEvent.click(l2);

		expect(spy).toHaveBeenCalledWith(
			'Breadcrumbs:LinkClick',
			'Breadcrumbs:LinkClick',
			{
				linkText: 'Federal Contracting',
				location: 'Breadcrumbs',
				section: 'L2',
			}
		);

		const l3 = await screen.findByRole('link', {
			name: 'Contracting assistance programs',
		});
		fireEvent.click(l3);

		expect(spy).toHaveBeenCalledWith(
			'Breadcrumbs:LinkClick',
			'Breadcrumbs:LinkClick',
			{
				linkText: 'Contracting assistance programs',
				location: 'Breadcrumbs',
				section: 'L3',
			}
		);
	});

	it('sends error analytics if bad content', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// language=HTML
		const breadcrumbs = `
			<nav class="usa-breadcrumb usa-breadcrumb--wrap" aria-label="Wrapping Breadcrumbs Example">
				<ol class="usa-breadcrumb__list">
					<li class="usa-breadcrumb__list-item">
						<a href="example/path" class="usa-breadcrumb__link">
							<span></span>
						</a>
					</li>
					<li class="usa-breadcrumb__list-item">
						<a href="example/path" class="usa-breadcrumb__link"></a>
					</li>
				</ol>
			</nav>
		`;

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', breadcrumbs);

		// Create the banner JS
		breadcrumbInit();

		const links = await screen.findAllByRole('link');

		fireEvent.click(links[0]);
		expect(spy).toHaveBeenCalledWith(
			'Breadcrumbs:LinkClick',
			'Breadcrumbs:LinkClick',
			{
				linkText: '_ERROR_',
				location: 'Breadcrumbs',
				section: 'L1',
			}
		);

		fireEvent.click(links[1]);
		expect(spy).toHaveBeenCalledWith(
			'Breadcrumbs:LinkClick',
			'Breadcrumbs:LinkClick',
			{
				linkText: '_ERROR_',
				location: 'Breadcrumbs',
				section: 'L2',
			}
		);
	});

	it('does not blow up if no breadcrumbs', async () => {
		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// language=HTML
		const breadcrumbs = `<div>This is not the Breadcrumbs you are looking for</div>`;

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', breadcrumbs);

		// Create the banner JS
		breadcrumbInit();

		expect(spy).not.toHaveBeenCalled();
	});
});
