import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, screen, waitFor } from '@testing-library/dom';

import * as eddlUtil from '../../../core/analytics/eddl-util';

import siteAlertInit from '../usa-site-alert';

jest.mock('../../../core/analytics/eddl-util');

describe('usa-site-alert', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.cookie = 'NCISiteAlertsite-alert=; Path=/;';
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('sending the correct analytics for slim link click', () => {
		const siteAlert = `
		<section
				aria-label="Slim emergency site alert example"
				class="usa-site-alert usa-site-alert--nci-slim usa-site-alert--nci-emergency"
				id="site-alert-example1"
		>
				<div class="usa-alert">
					<div class="usa-alert__body">
						<div class="usa-alert__text">
								<strong>Short alert message.</strong> Additional context and followup
								information including <a class="usa-link" href="#">a link</a>.
						</div>
					</div>
				</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		const link = screen.getByRole('link');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: 'a link',
				location: 'PreHeader',
				action: 'Link Click',
				preHeaderElement: 'Slim Alert',
			}
		);
	});

	it('sending the correct analytics for standard link click', async () => {
		const siteAlert = `
		<section
			aria-label="Standard information site alert example with close"
			class="usa-site-alert usa-site-alert--nci-standard usa-site-alert--nci-info"
			id="site-alert-example2"
			data-site-alert-closable="true"
		>
    	<div class="usa-alert">
        <div class="usa-alert__body">
            <header class="usa-alert__nci-header">
                <h3 class="usa-alert__heading">COVID-19 resources.</h3>
            </header>
            <div class="usa-alert__nci-content" id="gov-banner-default1">
                <ul class="usa-alert__nci-list">
                    <li>
                        <a class="usa-link" href="/about-cancer">
                            What people with cancer should know
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-nci">
                            Get the latest public health information from CDC
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-cancer"> Guidance for cancer researchers </a>
                    </li>
                    <li>
                        <a class="usa-link" href="about-nci">
                            Get the latest research information from NIH
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    	</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		//toggles the collapse button
		const collapse = screen.getByRole('button', { expanded: false });

		//click the collapse button
		fireEvent.click(collapse);

		const links = await screen.findAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: 'What people with cancer should know',
				location: 'PreHeader',
				action: 'Link Click',
				preHeaderElement: 'Standard Alert',
			}
		);
	});

	it('bad link click for standard alert', async () => {
		const siteAlert = `
		<section
			aria-label="Standard information site alert example with close"
			class="usa-site-alert usa-site-alert--nci-standard usa-site-alert--nci-info"
			id="site-alert-example3"
			data-site-alert-closable="true"
		>
    	<div class="usa-alert">
        <div class="usa-alert__body">
            <header class="usa-alert__nci-header">
                <h3 class="usa-alert__heading">COVID-19 resources.</h3>
            </header>
            <div class="usa-alert__nci-content" id="gov-banner-default1">
                <ul class="usa-alert__nci-list">
                    <li>
                        <a class="usa-link" href="/about-cancer">
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-nci">
                            Get the latest public health information from CDC
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-cancer"> Guidance for cancer researchers </a>
                    </li>
                    <li>
                        <a class="usa-link" href="about-nci">
                            Get the latest research information from NIH
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    	</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		//toggles the collapse button
		const collapse = screen.getByRole('button', { expanded: false });

		//click the collapse button
		fireEvent.click(collapse);

		const links = await screen.findAllByRole('link');

		// Click the link
		fireEvent.click(links[0]);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: '_ERROR_',
				location: 'PreHeader',
				action: 'Link Click',
				preHeaderElement: 'Standard Alert',
			}
		);
	});

	it('bad link click for slim alert', () => {
		const siteAlert = `
		<section
				aria-label="Slim emergency site alert example"
				class="usa-site-alert usa-site-alert--nci-slim usa-site-alert--nci-emergency"
				id="site-alert-example4"
		>
				<div class="usa-alert">
					<div class="usa-alert__body">
						<div class="usa-alert__text">
								<strong>Short alert message.</strong> Additional context and followup
								information including <a class="usa-link" href="#" data-testid="linkTest"></a>.
						</div>
					</div>
				</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		const link = screen.getByTestId('linkTest');

		// Click the link
		fireEvent.click(link);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: '_ERROR_',
				location: 'PreHeader',
				action: 'Link Click',
				preHeaderElement: 'Slim Alert',
			}
		);
	});

	it('sending the correct analytics for standard expand', async () => {
		const siteAlert = `
		<section
			aria-label="Standard information site alert example with close"
			class="usa-site-alert usa-site-alert--nci-standard usa-site-alert--nci-info"
			id="site-alert-example5"
			data-site-alert-closable="true"
		>
    	<div class="usa-alert">
        <div class="usa-alert__body">
            <header class="usa-alert__nci-header">
                <h3 class="usa-alert__heading">COVID-19 resources.</h3>
            </header>
            <div class="usa-alert__nci-content" id="gov-banner-default1">
                <ul class="usa-alert__nci-list">
                    <li>
                        <a class="usa-link" href="/about-cancer">
                            What people with cancer should know
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-nci">
                            Get the latest public health information from CDC
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-cancer"> Guidance for cancer researchers </a>
                    </li>
                    <li>
                        <a class="usa-link" href="about-nci">
                            Get the latest research information from NIH
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    	</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		//toggles the expand button
		const expand = screen.getByRole('button', { expanded: false });

		//click the expand button
		fireEvent.click(expand);

		expect(spy).toHaveBeenCalledTimes(1);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: 'Expand',
				location: 'PreHeader',
				action: 'Expand',
				preHeaderElement: 'Standard Alert',
			}
		);
	});

	it('sending the correct analytics for standard minimize', async () => {
		const siteAlert = `
		<section
			aria-label="Standard information site alert example with close"
			class="usa-site-alert usa-site-alert--nci-standard usa-site-alert--nci-info"
			id="site-alert-example6"
			data-site-alert-closable="true"
		>
    	<div class="usa-alert">
        <div class="usa-alert__body">
            <header class="usa-alert__nci-header">
                <h3 class="usa-alert__heading">COVID-19 resources.</h3>
            </header>
            <div class="usa-alert__nci-content" id="gov-banner-default1">
                <ul class="usa-alert__nci-list">
                    <li>
                        <a class="usa-link" href="/about-cancer">
                            What people with cancer should know
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-nci">
                            Get the latest public health information from CDC
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-cancer"> Guidance for cancer researchers </a>
                    </li>
                    <li>
                        <a class="usa-link" href="about-nci">
                            Get the latest research information from NIH
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    	</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		//toggles the expand button
		const expand = screen.getByRole('button', { expanded: false });

		// clicks the expand button
		fireEvent.click(expand);

		//toggles the collapse button
		const minimize = await screen.findByRole('button', { expanded: true });

		//click the collapse button
		fireEvent.click(minimize);

		expect(spy).toHaveBeenCalledWith(
			'PreHeader:LinkClick',
			'PreHeader:LinkClick',
			{
				linkText: 'Minimize',
				location: 'PreHeader',
				action: 'Minimize',
				preHeaderElement: 'Standard Alert',
			}
		);
	});

	it('sending the correct analytics for standard dismiss', async () => {
		const siteAlert = `
		<section
			aria-label="Standard information site alert example with close"
			class="usa-site-alert usa-site-alert--nci-standard usa-site-alert--nci-info"
			id="site-alert-example7"
			data-site-alert-closable="true"
		>
    	<div class="usa-alert">
        <div class="usa-alert__body">
            <header class="usa-alert__nci-header">
                <h3 class="usa-alert__heading">COVID-19 resources.</h3>
            </header>
            <div class="usa-alert__nci-content" id="gov-banner-default1">
                <ul class="usa-alert__nci-list">
                    <li>
                        <a class="usa-link" href="/about-cancer">
                            What people with cancer should know
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-nci">
                            Get the latest public health information from CDC
                        </a>
                    </li>
                    <li>
                        <a class="usa-link" href="/about-cancer"> Guidance for cancer researchers </a>
                    </li>
                    <li>
                        <a class="usa-link" href="about-nci">
                            Get the latest research information from NIH
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    	</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		//toggles the close button
		const dismiss = screen.getByRole('button', { name: 'Dismiss alert' });

		// clicks the close button
		fireEvent.click(dismiss);

		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				'PreHeader:LinkClick',
				'PreHeader:LinkClick',
				{
					linkText: 'Dismiss',
					location: 'PreHeader',
					action: 'Dismiss',
					preHeaderElement: 'Standard Alert',
				}
			);
		});
	});

	it('sending the correct analytics for slim dismiss', async () => {
		const siteAlert = `
		<section
			aria-label="Slim information site alert example with close"
			class="usa-site-alert usa-site-alert--nci-slim usa-site-alert--nci-info"
			id="site-alert-example8"
			data-site-alert-closable="true"
		>
			<div class="usa-alert">
					<div class="usa-alert__body">
							<div class="usa-alert__text">
									<strong>Short alert message.</strong> Additional context and followup
									information including <a class="usa-link" href="#">a link</a>.
							</div>
					</div>
			</div>
		</section>
		`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		//toggles the close button
		const dismiss = screen.getByRole('button', { name: 'Dismiss alert' });

		// clicks the close button
		fireEvent.click(dismiss);

		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				'PreHeader:LinkClick',
				'PreHeader:LinkClick',
				{
					linkText: 'Dismiss',
					location: 'PreHeader',
					action: 'Dismiss',
					preHeaderElement: 'Slim Alert',
				}
			);
		});
	});

	it('does not blow up if component does not exist', () => {
		const siteAlert = `<div>Is this working?</div>`;

		// Lets make a spy to ensure that trackOther is called correctly
		const spy = jest.spyOn(eddlUtil, 'trackOther');

		// Inject the HTML into the dom.
		document.body.insertAdjacentHTML('beforeend', siteAlert);

		// Create the site alert JS
		siteAlertInit();

		expect(spy).not.toHaveBeenCalled();

		expect(screen.queryByRole('region')).not.toBeInTheDocument();
	});
});
