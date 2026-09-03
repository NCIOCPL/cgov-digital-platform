import { Given, Then } from "cypress-cucumber-preprocessor/steps";

const drushCmd = Cypress.env('DRUSH_BIN') || 'drush';
Given('user navigates to {string}', (path) => {
    cy.visit(path);
})
Then('browser title is {string}', (title) => {
    cy.title().should('eq', title)
})

And('page title is {string}', (title) => {
    cy.get(`h1:contains('${title}')`).should('be.visible');
});

When('user logs in with a role {string}', (username) => {
    cy.login(username, "password123");
})

When('user clicks on {string} tab', (option) => {
    cy.get('ul.toolbar-menu>li>a:visible').contains(option).click({ force: true });
});

And('user clicks on {string} action button', (buttonLabel) => {
    cy.get(`ul.local-actions a:contains(${buttonLabel})`).click({ force: true });
});
And('user clicks on {string} content type', (contentType) => {
    cy.get(`div.admin-item a:contains('${contentType}')`).click({ force: true });
});

When('user selects test site section', () => {
    cy.get('summary[aria-controls*="edit-field-site-section"]').click();
    cy.get("input[value='Select Site Section']").click();

    cy.wait(3000);

    // 1. THE PROVEN ATOMIC FILTER
    // We restore the logic from Run 9 that successfully bypassed the double-submit
    // filter deadlock. One keystroke, one request.
    cy.get('iframe.entity-browser-modal-iframe').then($iframe => {
        const $body = $iframe.contents().find('body');

        $body.find('td.views-field-entity-browser-select input').first().addClass('cy-stale-row');

        cy.wrap($body.find('input[name="computed_path_value"]'))
          .clear()
          .type('test-site-section{enter}', { delay: 0 });
    });

    // 2. WAIT FOR DOM ANNIHILATION
    // Guarantees the Filter AJAX is 100% finished.
    cy.get('iframe.entity-browser-modal-iframe', { timeout: 45000 }).should($iframe => {
        const $body = $iframe.contents().find('body');
        expect($body.find('.cy-stale-row').length, 'Old table DOM must be replaced').to.equal(0);
        expect($body.find('td:contains("test-site-section")').length, 'Filtered text should appear').to.be.greaterThan(0);
    });

    cy.wait(2000);

    // 3. NATIVE CHECKBOX
    cy.get('iframe.entity-browser-modal-iframe').then($iframe => {
        const $body = $iframe.contents().find('body');
        const $checkbox = $body.find('td:contains("test-site-section")').first().parent().find('td.views-field-entity-browser-select input');

        cy.wrap($checkbox).check({ force: true });
    });

    // 4. THE BRUTE-FORCE CI RUNWAY
    // 3 seconds was not enough for the CI server. We give the single PHP thread
    // 10 full seconds to finish the checkbox AJAX and unlock the session file.
    // No assertions, no phantom passes. Just an unbreakable lock.
    cy.wait(10000);

    // 5. THE FINAL CLICK
    cy.get('iframe.entity-browser-modal-iframe').then($iframe => {
        const $body = $iframe.contents().find('body');
        const $submitBtn = $body.find("input[id^='edit-submit'][value='Select Site Section']");

        // Native click, safely isolated by the 10-second runway.
        cy.wrap($submitBtn).click({ force: true });
    });

    // 6. Ensure modal dialog completely detaches
    cy.get('iframe.entity-browser-modal-iframe', { timeout: 60000 }).should('not.exist');
});

And('user fills out the following fields', (dataTable) => {
  for (const { fieldLabel, value, field_name } of dataTable.hashes()) {
      cy.get(`input[name^='${field_name}']`).as('inputField').parent().find('label').should('include.text', fieldLabel);
      cy.get('@inputField').type(value);
  }
});

And('user selects {string} from {string} dropdown', (option, dropdown) => {
    cy.get(`label:contains('${dropdown}')`).each(($el) => {
        const text = $el[0].innerText;
        if (text === dropdown) {
            cy.wrap($el).parent().find('select').select(option)
        }
    })
});

When('user saves the content page', () => {
    cy.get("input[id='edit-submit']").click({ force: true });
});

And('user checks {string} checkbox to set section', (setNavRoot) => {
    cy.get(`label:contains("${setNavRoot}")`).parent().find('input').check();
});

And('user clicks on {string} sub tab', (contentSubTab) => {
    cy.get(`a.admin-item__link:contains("${contentSubTab}")`).click({ force: true });
});

And('user selects {string} option from Operations for {string}', (option, label) => {
    cy.get(`.dropbutton >.list > a:contains("${option}")`).last().click({ force: true });
});

And('user selects {string} from Blog Series dropdown', (blogSeries) => {
    cy.get('select[name="field_blog_series"] option').each($opt => {
        if (($opt[0].textContent).includes(blogSeries)) {
            cy.get('select[name="field_blog_series"]').select($opt[0].textContent);
            return;
        }
    })
});

And('browser waits', () => {
    cy.wait(2000);
});

And('user creates new user with username {string}', (username) => {
    cy.exec(`${drushCmd} user:create ${username} --mail="${username}@example.com" --password="password123"`);
});

And('user adds the following roles to the following users', (dataTable) => {
    for (const { roles, users } of dataTable.hashes()) {
        cy.exec(`${drushCmd} user-add-role "${roles}" ${users}`)
    }
})

And('I should see {string} and {string} when I navigate to the following urls while logged in with the following users', (option1, option2, dataTable) => {
    for (const { URLs, users } of dataTable.hashes()) {
        cy.login(users, "password123");
        cy.visit(URLs)
        cy.get(`label:contains('Save as')`).parent().find('select').select(option1)
        cy.get(`label:contains('Save as')`).parent().find('select').select(option2)

    }
})

And('user clicks on Add PDQ Summary Section button', () => {
    cy.get("input[value='Add PDQ Summary Section']").click({ force: true });
})

When('user clicks on {string} tab', (option) => {
    cy.get('ul.toolbar-menu>li>a:visible').contains(option).click({ force: true });
});

And('user fills out {string} with {string}', (section, text) => {
    if (section == "Section HTML") {
        cy.get(`label:contains("${section}")`).parent().parent().find('div.form-textarea-wrapper').type(text)
    }
    if (section == "Body") {
        cy.get("textarea[id^=edit-body-0-value").type(text)
    }
})

And('user selects {string} checkbox', (checkbox) => {
    cy.get(`label[for*='edit-field-date-display-mode']:contains("${checkbox}")`).parent().find('input[class*="form-checkbox"]').check({ force: true })
})

And('user selects {string} from the {string} dropdown', (option, dropdown) => {
    cy.get(`label:contains('${dropdown}')`).parent().find('select').first().select(option).should('have.value', 'cgov_js_only_app');
});

And('user clears out {string} text field', (settingField) => {
    cy.get(`label:contains('${settingField}')`).parent().find('textarea').clear();
});


And('user enters {string} into app config text field', (value) => {
    cy.get('textarea#edit-field-application-module-0-data').type(value, { parseSpecialCharSequences: false });
});

And('{string} user password is changed to {string}', (username, password) => {
    cy.exec(`drush user:password ${username} '${password}'`)
});
