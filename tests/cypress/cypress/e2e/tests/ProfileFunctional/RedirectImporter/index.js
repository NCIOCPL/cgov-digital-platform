import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import { drush, fixture, fixtureToken, login } from '../../../../support/profile-tests';

let token;

beforeEach(() => {
    token = fixtureToken();
});

afterEach(() => {
    fixture('cleanup-redirects', token);
    fixture('cleanup-accounts', token);
});

Given('a dedicated redirect administrator', () => {
    fixture('account-admin', token).then(login);
    fixture('queue-count', token).should('eq', 0);
});

When('the administrator uploads the redirect CSV', () => {
    const csv = [
        `/espanol/${token}/foo/bar,/espanol/${token}/bar/bazz2`,
        `/${token}/foo/bar,/${token}/bar/bazz`,
        `/${token}/bazz/bob,/${token}/blee/bargh,301,en`,
        ` /${token}/blee,  /${token}/blab`,
        `/${token}/chicken,https://www.google.com,301,es`,
    ].join('\n');
    cy.visit('/admin/config/search/cgov-redirect-manager');
    cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(csv),
        fileName: `${token}.csv`,
        mimeType: 'text/csv',
    });
    cy.contains('input[type="submit"]', 'Upload Redirects').click();
    cy.contains('Successfully uploaded redirect file.').should('be.visible');
});

Then('one redirect import is queued', () => {
    fixture('queue-count', token).should('eq', 1);
});

When('the redirect import queue is processed', () => {
    drush('queue:run cgov_redirect_manager_queue_worker');
});

Then('the redirect import queue is empty', () => {
    fixture('queue-count', token).should('eq', 0);
});

Then('all five imported URLs redirect to their expected destinations', () => {
    cy.clearCookies();
    const redirects = [
        [`/espanol/${token}/foo/bar`, `/espanol/${token}/bar/bazz2`],
        [`/${token}/foo/bar`, `/${token}/bar/bazz`],
        [`/${token}/bazz/bob`, `/${token}/blee/bargh`],
        [`/${token}/blee`, `/${token}/blab`],
        [`/espanol/${token}/chicken`, 'https://www.google.com'],
    ];
    redirects.forEach(([url, destination]) => {
        cy.request({ url, followRedirect: false }).then((response) => {
            expect(response.status).to.eq(301);
            expect(new URL(response.headers.location, Cypress.config('baseUrl')).href)
                .to.eq(new URL(destination, Cypress.config('baseUrl')).href);
        });
    });
});
