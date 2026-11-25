import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import { fixture, fixtureToken, login } from '../../../../support/profile-tests';

let token;
let uid;
const mappings = '/admin/config/people/saml/authmap';

beforeEach(() => {
    token = fixtureToken();
    uid = undefined;
});

afterEach(() => {
    fixture('cleanup-accounts', token);
});

function noPasswordFields() {
    cy.get('input[name="pass[pass1]"], input[name="pass[pass2]"]').should('not.exist');
}

Given('a dedicated SAML administrator', () => {
    fixture('account-admin', token).then(login);
});

When('the administrator creates a user without password fields', () => {
    cy.visit('/admin/people/create');
    noPasswordFields();
    cy.get('input[name="name"]').type(`${token}_saml`);
    cy.get('input[name="mail"]').type(`${token}_saml@example.com`);
    cy.get('input[name="notify"]').uncheck();
    cy.contains('input[type="submit"]', 'Create new account').click();
    cy.contains('Created a new user account').should('be.visible');
});

Then('the new user has a SAML mapping', () => {
    cy.visit(`${mappings}?authname=${token}_saml`);
    cy.get('td.views-field-authname').should('have.length', 1)
        .should(($cell) => { expect($cell.text().trim()).to.eq(`${token}_saml`); })
        .closest('tr').within(() => {
            cy.get('td.views-field-uid').invoke('text').then((value) => {
                uid = value.trim();
                expect(uid).to.match(/^\d+$/);
            });
        });
});

When('the administrator removes the mapping and saves the user without password fields', () => {
    cy.then(() => {
        cy.visit(`/user/${uid}/edit`);
        noPasswordFields();
        cy.visit(`${mappings}/${uid}/delete`);
        cy.get('input#edit-submit').click();
        cy.visit(`${mappings}?authname=${token}_saml`);
        cy.get('td.views-field-authname').should('not.exist');
        cy.visit(`/user/${uid}/edit`);
        noPasswordFields();
        cy.get('input#edit-submit').click();
    });
});

When('a visitor submits the Drupal login form with {string}', (credentials) => {
    cy.visit('/user/login?show_login_fields=true');
    cy.get('form.usa-form').should('have.attr', 'novalidate');
    if (credentials === 'username only') {
        cy.get('input[name="name"]').type(token);
    }
    if (credentials === 'password only') {
        cy.get('input[name="pass"]').type('missing-username', { log: false });
    }
    cy.get('form.user-login-form').submit();
});

Then('the login form shows the accessible generic credential error', () => {
    cy.contains('Unrecognized username or password.').should('be.visible');
    cy.get('input[name="name"]').should('have.class', 'usa-input--error')
        .and('have.attr', 'autofocus');
    cy.get('input[name="name"]').invoke('attr', 'aria-describedby')
        .should('include', 'edit-name--error');
    cy.get('#edit-name--error.usa-error-message').should('be.visible');
    cy.contains('Username field is required.').should('not.exist');
    cy.contains('Password field is required.').should('not.exist');
});

Then('the Drupal login action preserves its query parameters', () => {
    cy.visit('/user/login?show_login_fields=true&destination=/admin/content');
    cy.get('form.user-login-form').invoke('attr', 'action').then((action) => {
        const query = new URL(action, Cypress.config('baseUrl')).searchParams;
        expect(query.get('show_login_fields')).to.eq('true');
        expect(query.get('destination')).to.eq('/admin/content');
    });
});
