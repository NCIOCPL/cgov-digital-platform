// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('login', (username, password) => {
  cy.session(
    username,
    () => {
      cy.visit('/user/login')
      cy.get('input#edit-name').type(username)
      cy.get('input#edit-pass').type(`${password}{enter}`, { log: false })
      cy.get('#toolbar-item-user').should('include.text', username).and('be.visible');
    },
    {
     
      validate: () => {
        cy.getCookie('s_fid').should('exist')
      },
      cacheAcrossSpecs: true
    }
  )
})


Cypress.Commands.add('getIframeBody', (locator) => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  return cy
    .get(locator)
    .its('0.contentDocument.body').should('not.be.empty')
    // wraps "body" DOM element to allow
    // chaining more Cypress commands, like ".find(...)"
    // https://on.cypress.io/wrap
    .then(cy.wrap)
})
