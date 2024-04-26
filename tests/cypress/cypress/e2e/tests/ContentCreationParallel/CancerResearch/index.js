
import { When } from "cypress-cucumber-preprocessor/steps";

When('user selects test site section', () => {
    cy.get('summary[aria-controls*="edit-field-site-section"]').click();
    cy.get("input[value='Select Site Section']").click();
    cy.waitForNetworkIdle(1000)
    cy.getIframeBody('iframe.entity-browser-modal-iframe')
        .find('input[name="computed_path_value"]').type('test-site-section');
    cy.getIframeBody('iframe.entity-browser-modal-iframe')
        .find('input#edit-submit-site-section-browser').click();
    cy.waitForNetworkIdle(1000)
    cy.getIframeBody('iframe.entity-browser-modal-iframe')
        .find('td:contains("test-site-section")').first().parent()
        .find('td.views-field.views-field-entity-browser-select input').check();
    cy.waitForNetworkIdle(1000)
    cy.getIframeBody('iframe.entity-browser-modal-iframe')
        .find("input[id='edit-submit'][value='Select Site Section']").click();
    cy.waitForNetworkIdle(1000)
});