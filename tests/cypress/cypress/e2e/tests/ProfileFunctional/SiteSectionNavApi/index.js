import { Given, Then } from 'cypress-cucumber-preprocessor/steps';
import { fixture, fixtureToken } from '../../../../support/profile-tests';

let token;
let terms;

beforeEach(() => {
    token = fixtureToken();
});

afterEach(() => {
    fixture('cleanup-navigation', token);
});

Given('dedicated navigation API fixtures', () => {
    fixture('navigation', token).then((ids) => {
        terms = ids;
    });
});

Then('section and mobile navigation require a published landing page and navigation root', () => {
    ['section-nav', 'mobile-nav'].forEach((endpoint) => {
        [['published', 200], ['unpublished', 400], ['nonroot', 400]].forEach(([term, status]) => {
            cy.request({ url: `/taxonomy/term/${terms[term]}/${endpoint}`, failOnStatusCode: false, followRedirect: false })
                .its('status').should('eq', status);
        });
    });
});

Then('the megamenu endpoint requires a published content block', () => {
    [['megamenu', 200], ['empty', 404]].forEach(([term, status]) => {
        cy.request({ url: `/taxonomy/term/${terms[term]}/mega-menu`, failOnStatusCode: false, followRedirect: false })
            .its('status').should('eq', status);
    });
});
