# PDQ API tests

BLT runs `PdqApis.feature` after the parallel test phase. Keep both scenarios in
this single feature: cypress-parallel then uses one worker, so glossary refresh
and orphan pruning cannot race with other specs. Running all feature files
directly in parallel bypasses this isolation.

Use a disposable test site. The summary scenario drains **all** pre-existing
orphaned PDQ summary sections before creating its fixtures. It then checks the
exact pruning count for its own lifecycle. Catalog assertions select its two
unique CDR IDs instead of assuming an empty site. Generated taxonomy branches
are checked and removed through the UI; existing language roots are preserved.

The glossifier scenario snapshots the exact glossary rows, including timestamps,
to `/tmp/<fixture-token>-glossary.json` in the PHP container. Its cleanup hook
restores those rows and deletes the snapshot. If the runner is interrupted,
restore the snapshot before another run with:

```sh
ddev drush --uri=http://127.0.0.1:8888 php:script /var/www/html/tests/cypress/scripts/profile-fixtures.php -- glossary-restore <fixture-token>
```

Use the same URI as the Cypress run if its base URL was overridden. Fixture
tokens appear in the Cypress command log. Account cleanup can also be
repeated with the `cleanup-accounts` operation and that token. Normal assertion
failures run cleanup hooks; terminating the browser or container may leave test
accounts, content, or uploaded files behind.

## Coverage mapping

| Removed PHP coverage | Replacement |
| --- | --- |
| `CgovImporterServiceTest::testRedirectManager` | `RedirectImporter.feature`: upload success, queue counts 1/0, Drush processing, five HTTP redirect destinations, Spanish inference/explicit language, trimming and external URL |
| `PdqNodeTypeTest::testNodeTypesArePresent` | Content type existence is covered by the cancer summary lifecycle in `PdqApis.feature`; the nonempty label and description checks are retired |
| `CgovSamlAuthConfigTest::testUserFormAlterations` | `SamlAuth.feature`: absent password fields on creation/edit, mapping creation, UI deletion, absence, and recreation after saving |
| `CgovSamlAuthConfigTest::testMissingCredentialsLoginError` | Three examples: both fields empty, username only, password only; novalidate, generic message, username error class, describedby, autofocus, inline error, no field-required messages |
| `CgovSamlAuthConfigTest::testLoginFormActionPreservesQueryParameters` | `SamlAuth.feature`: bypass flag and destination parsed from the login action |
| `CgovSiteSectionNavApiTest::testApis` | `SiteSectionNavApi.feature`: all six section/mobile status checks and both megamenu status checks using equivalent entity fixtures and the original YAML |
| Cancer summary API creation/revisions | `PdqApis.feature`: Spanish-first rejection, 201/200 statuses, shared node ID, CDR lookup shape/language, all 14 payload fields, public_use, missing Spanish translation and unpublished/published state |
| Cancer summary publication/navigation | Both initial and revised public titles, canonical/alias HTML equality, deferred terms, every hierarchy segment/name/language/parent, leaf landing page/computed path, language roots, draft label isolation and publication |
| Cancer summary catalog/deletion/pruning | Two owned ordered entries with all seven catalog fields, numeric revision IDs and datetime formats; English-first deletion rejection and retained lookup; Spanish then English 204/404 responses; exact orphan count |
| Glossifier API | Original seven glossary terms and unchanged fragment; refresh message, ordinary authenticated access, ordered match count and all six expected fields for every match |

`CgovSiteTest` and the drug summary API test remain unchanged. No production
routes, permissions, configuration defaults, or dependencies are added.
