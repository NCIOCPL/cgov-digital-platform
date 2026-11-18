import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import { fixture, fixtureToken, login, password } from '../../../support/profile-tests';
import summaries from '../../../fixtures/pdq-summaries.json';
import glossifier from '../../../fixtures/pdq-glossifier.json';

let token;
let pathPrefix;
let translations;
let importer;
let admin;
let reader;
let lifecycle;
let sectionCount;
let publishedLabel;

beforeEach(() => {
    token = fixtureToken();
    // Pathauto removes underscores, so keep URL segments separate from account IDs.
    pathPrefix = token.replace(/_/g, '-');
    translations = Cypress._.cloneDeep(summaries);
    // Stay within Drupal's signed integer field while avoiding sample-content IDs.
    const cdrId = Cypress._.random(100000000, 999999999) * 2;
    ['en', 'es'].forEach((language, index) => {
        translations[language].cdr_id = cdrId + index;
        translations[language].url = `/${pathPrefix}${translations[language].url}`;
    });
    importer = admin = reader = undefined;
    lifecycle = false;
    sectionCount = 0;
});

afterEach(() => {
    // Restore global glossary state before attempting any other cleanup.
    fixture('glossary-restore', token);
    cy.then(() => {
        if (lifecycle && importer) {
            api('DELETE', `/pdq/api/${translations.es.cdr_id}`, undefined, 204);
            api('DELETE', `/pdq/api/${translations.en.cdr_id}`, undefined, 204);
            prune();
            login(admin);
            removeSiteSections();
        }
    });
    fixture('cleanup-accounts', token);
});

function api(method, url, body, status = 200) {
    // Cypress forwards session cookies, which require CSRF even with Basic Auth.
    return cy.request('/session/token').then(({ body: csrfToken }) => cy.request({
        method,
        url,
        qs: { _format: 'json' },
        auth: { username: importer.name, password },
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: body === undefined ? undefined : JSON.stringify(body),
        failOnStatusCode: false,
        followRedirect: false,
    })).then((response) => {
        expect(response.status, `${method} ${url}`).to.eq(status);
        return response.body;
    });
}

function prune() {
    return api('PATCH', '/pdq/api/cis/prune', 1000).then((dropped) => {
        expect(dropped).to.be.an('array');
        if (dropped.length) {
            return prune();
        }
    });
}

function store(summary, status = 200) {
    return api('POST', '/pdq/api/cis', summary, status).then((payload) => {
        sectionCount += summary.sections.length;
        if (summary.nid !== null) {
            expect(Number(payload.nid), 'Revisions and translations share a node').to.eq(Number(summary.nid));
        }
        return payload;
    });
}

function findNode(summary) {
    return api('GET', `/pdq/api/${summary.cdr_id}`).then((pairs) => {
        expect(pairs).to.have.length(1);
        expect(pairs[0]).to.have.length(2);
        expect(String(pairs[0][0])).to.match(/^\d+$/);
        expect(Number.isInteger(Number(pairs[0][0]))).to.eq(true);
        expect(pairs[0][1]).to.be.oneOf(['en', 'es']);
        expect(Number(pairs[0][0])).to.eq(Number(summary.nid));
        expect(pairs[0][1]).to.eq(summary.language);
    });
}

function checkValues(languages, published) {
    api('GET', `/pdq/api/cis/${translations.en.nid}`).then((values) => {
        expect(Number(values.nid)).to.eq(Number(translations.en.nid));
        ['en', 'es'].forEach((language) => {
            if (!languages.includes(language)) {
                expect(values).not.to.have.property(language);
                return;
            }
            const actual = values[language];
            expect(Number(actual.public_use)).to.eq(1);
            expect(Number(actual.published)).to.eq(published);
            Object.entries(translations[language]).forEach(([field, value]) => {
                if (['nid', 'language'].includes(field)) return;
                if (['cdr_id', 'svpc', 'suppress_otp'].includes(field)) {
                    expect(Number(actual[field]), `${language}: ${field}`).to.eq(value);
                } else {
                    expect(actual[field], `${language}: ${field}`).to.deep.eq(value);
                }
            });
        });
    });
}

function publish(languages = ['en', 'es']) {
    return api('POST', '/pdq/api', languages.map((language) => [translations[language].nid, language]))
        .then((payload) => {
            expect(payload.errors).to.be.empty;
        });
}

function publicSummaries(checkAliases = false) {
    cy.clearCookies();
    Object.values(translations).forEach((summary) => {
        const prefix = summary.language === 'es' ? '/espanol' : '';
        cy.request(`${prefix}/node/${summary.nid}`).then((canonical) => {
            expect(canonical.status).to.eq(200);
            const page = new DOMParser().parseFromString(canonical.body, 'text/html');
            expect(page.querySelector('h1').textContent.trim()).to.eq(summary.title);
            if (checkAliases) {
                cy.request(`${prefix}${summary.url}`).then((alias) => {
                    expect(alias.status).to.eq(200);
                    expect(alias.body).to.eq(canonical.body);
                });
            }
        });
    });
}

function siteSectionRows(language) {
    const query = new URLSearchParams({ computed_path_value: `/${pathPrefix}`, langcode: language });
    cy.visit(`/entity-browser/modal/cgov_site_section_browser?${query}`);
    cy.get('input[name="computed_path_value"]').should('have.value', `/${pathPrefix}`);
    return cy.get('body').then(($body) => $body.find('tr').get()
        .filter((row) => row.querySelector('input[name^="entity_browser_select"]'))
        .map((row) => ({
            id: row.querySelector('input[name^="entity_browser_select"]').value.split(':')[1],
            path: row.querySelector('.views-field-computed-path-value').textContent.trim(),
        })));
}

function checkSiteSections(summary, label = summary.browser_title) {
    siteSectionRows(summary.language).then((rows) => {
        const tokens = summary.url.slice(1).split('/');
        expect(rows, 'Exactly one generated term per URL segment').to.have.length(tokens.length);
        const byPath = Object.fromEntries(rows.map((row) => [row.path, row]));
        const first = rows.find((row) => row.path.endsWith(`/${tokens[0]}`));
        expect(first, 'Generated branch root').to.exist;
        cy.visit(`/taxonomy/term/${first.id}/edit`);
        cy.get('select[name="parent[]"]').invoke('val').then((parents) => {
            expect(parents).to.have.length(1);
            const root = parents[0];
            expect(Number(root)).to.be.greaterThan(0);
            cy.visit(`/taxonomy/term/${root}/edit`);
            cy.get('select[name="parent[]"]').invoke('val').should('deep.eq', ['0']);
            cy.get('select[name="langcode[0][value]"]').should('have.value', summary.language);
            // The shared site's language root can have its own URL segment.
            cy.get('input[name="field_pretty_url[0][value]"]').invoke('val').then((rootSegment) => {
                const rootPath = rootSegment ? `/${rootSegment}` : '';
                tokens.forEach((segment, index) => {
                    const path = `${rootPath}/${tokens.slice(0, index + 1).join('/')}`;
                    const leaf = index === tokens.length - 1;
                    const row = byPath[path];
                    expect(row, `Computed path ${path}`).to.exist;
                    cy.visit(`/taxonomy/term/${row.id}/edit`);
                    cy.get('input[name="name[0][value]"]').should('have.value', leaf ? label : segment);
                    cy.get('select[name="langcode[0][value]"]').should('have.value', summary.language);
                    cy.get('input[name="field_pretty_url[0][value]"]').should('have.value', segment);
                    const parentPath = `${rootPath}/${tokens.slice(0, index).join('/')}`;
                    const parentId = index === 0 ? root : byPath[parentPath].id;
                    cy.get('select[name="parent[]"]').invoke('val').should('deep.eq', [parentId]);
                    if (leaf) {
                        cy.get('input[name="field_landing_page[0][target_id]"]').invoke('val')
                            .should('match', new RegExp(`\\(${summary.nid}\\)$`));
                    }
                });
            });
        });
    });
}

function removeSiteSections() {
    const sections = [];
    ['en', 'es'].forEach((language) => {
        siteSectionRows(language).then((rows) => sections.push(...rows));
    });
    cy.then(() => {
        sections.sort((a, b) => b.path.split('/').length - a.path.split('/').length)
            .forEach(({ id }) => {
                cy.visit(`/taxonomy/term/${id}/delete`);
                cy.get('input#edit-submit').click();
            });
    });
}

Given('dedicated PDQ importer and taxonomy administrator accounts', () => {
    fixture('account-admin', token).then((account) => { admin = account; });
    fixture('account-importer', token).then((account) => { importer = account; });
    Object.values(translations).forEach((summary) => {
        cy.then(() => api('GET', `/pdq/api/${summary.cdr_id}`, undefined, 404));
    });
    cy.then(() => { lifecycle = true; });
});

Given('the orphaned PDQ summary sections have been pruned', prune);

Then('creating the Spanish summary before English is rejected', () => {
    api('POST', '/pdq/api/cis', translations.es, 400).its('message')
        .should('eq', 'New summary node must be the English version');
});

When('the English cancer summary is imported', () => {
    store(translations.en, 201).then(({ nid }) => {
        translations.en.nid = translations.es.nid = nid;
    });
});

Then('the English summary is stored as an unpublished node', () => {
    findNode(translations.en);
    checkValues(['en'], 0);
});

When('the English cancer summary is revised', () => {
    Object.assign(translations.en, {
        description: 'Revised test description', svpc: 1, suppress_otp: 1,
        intro_text: '<p>Oh, look!</p>', cthp_card_title: 'No worries!',
    });
    translations.en.sections.push({ id: '_3', title: 'Section 3', html: '<p>3</p>' });
    store(translations.en);
});

When('the Spanish cancer summary is added to the same node', () => {
    store(translations.es);
    findNode(translations.es);
    findNode(translations.en);
});

Then('both summary translations are stored unpublished', () => checkValues(['en', 'es'], 0));
Then('both summary translations are stored published', () => checkValues(['en', 'es'], 1));

Then('summary site sections have not been created', () => {
    login(admin);
    ['en', 'es'].forEach((language) => siteSectionRows(language).should('be.empty'));
});

When('both cancer summary translations are published', () => publish());
Then('both public summaries and their aliases match', () => publicSummaries(true));

Then('both generated site section hierarchies match the summaries', () => {
    login(admin);
    Object.values(translations).forEach((summary) => checkSiteSections(summary));
});

When('the English navigation label is revised without publication', () => {
    publishedLabel = translations.en.browser_title;
    translations.en.browser_title = 'New Browser Title';
    store(translations.en);
});

Then('the English site section retains its published label', () => {
    checkSiteSections(translations.en, publishedLabel);
});

When('the English cancer summary is published', () => publish(['en']));
Then('the English site section uses the revised label', () => checkSiteSections(translations.en));

Then('the PDQ catalog describes both summary translations', () => {
    api('GET', '/pdq/api/list').then((catalog) => {
        const ids = Object.values(translations).map((summary) => summary.cdr_id);
        const entries = catalog.filter((entry) => ids.includes(Number(entry.cdr_id)));
        expect(entries).to.have.length(2);
        expect(entries.map((entry) => Number(entry.cdr_id))).to.deep.eq(ids);
        entries.forEach((entry, index) => {
            const summary = Object.values(translations)[index];
            expect(Object.keys(entry)).to.have.length(7);
            expect(Number(entry.cdr_id)).to.eq(summary.cdr_id);
            expect(Number(entry.nid)).to.eq(Number(summary.nid));
            expect(String(entry.vid)).to.match(/^\d+$/);
            expect(entry.langcode).to.eq(summary.language);
            expect(entry.type).to.eq('pdq_cancer_information_summary');
            ['created', 'changed'].forEach((field) => {
                expect(entry[field]).to.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
            });
        });
    });
});

When('revised English and Spanish titles are published', () => {
    translations.en.title = 'Three blind mice';
    translations.es.title = 'Tres ratones ciegos';
    store(translations.en);
    store(translations.es);
    publish();
});

Then('both public summaries show the revised titles', () => publicSummaries());

Then('deleting English before Spanish is rejected', () => {
    api('DELETE', `/pdq/api/${translations.en.cdr_id}`, undefined, 400).its('message')
        .should('eq', 'Spanish translation exists');
    findNode(translations.en);
});

When('the Spanish and English summaries are deleted in order', () => {
    ['es', 'en'].forEach((language) => {
        api('DELETE', `/pdq/api/${translations[language].cdr_id}`, undefined, 204);
        api('GET', `/pdq/api/${translations[language].cdr_id}`, undefined, 404);
    });
});

Then('pruning removes exactly the summary sections created by this lifecycle', () => {
    api('PATCH', '/pdq/api/cis/prune', 1000).should('have.length', sectionCount);
});

Given('a dedicated glossifier importer and an ordinary authenticated user', () => {
    fixture('account-importer', token).then((account) => { importer = account; });
    fixture('account-reader', token).then((account) => { reader = account; });
    fixture('glossary-snapshot', token);
});

When('the seven-term glossary is refreshed through the API', () => {
    api('POST', '/pdq/api/glossifier/refresh', glossifier.glossary).its('message')
        .should('match', /^Stored 7 glossary terms at /);
});

Then('the Spanish fragment produces all seven expected glossary matches', () => {
    login(reader);
    cy.request('/session/token').then(({ body: csrfToken }) => {
        cy.request({
            method: 'POST',
            url: '/pdq/api/glossifier?_format=json',
            headers: { 'X-CSRF-Token': csrfToken },
            body: { fragment: glossifier.fragment.join(''), languages: ['es'], dictionaries: ['Cancer.gov'] },
            followRedirect: false,
        }).then(({ status, body }) => {
            expect(status).to.eq(200);
            expect(body).to.have.length(glossifier.expected.length);
            glossifier.expected.forEach((expected, index) => {
                expect(body[index], `Match ${index + 1}`).to.include(expected);
            });
        });
    });
});
