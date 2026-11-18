export const password = 'password123';

export function fixtureToken() {
    return `cyprof_${Date.now().toString(36)}_${Cypress._.random(0, 0xffffff).toString(36)}`;
}

export function fixture(operation, token) {
    expect(operation).to.match(/^[a-z-]+$/);
    expect(token).to.match(/^cyprof_[a-z0-9_]{8,30}$/);
    return drush(`php:script "$PWD/scripts/profile-fixtures.php" -- ${operation} ${token}`)
        .then(({ stdout }) => JSON.parse(stdout));
}

export function drush(command) {
    const origin = new URL(Cypress.config('baseUrl')).origin.replace(/'/g, "'\\''");
    return cy.exec(`drush --uri='${origin}' ${command}`);
}

export function login(account) {
    cy.clearCookies();
    return cy.request({
        method: 'POST',
        url: '/user/login?_format=json',
        body: { name: account.name, pass: password },
        log: false,
    }).its('body.current_user.name').should('eq', account.name);
}
