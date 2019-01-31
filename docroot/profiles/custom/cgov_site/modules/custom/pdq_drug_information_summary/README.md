## Purpose
This module defines the fields, etc. specific to the PDQ Drug Information Summary content type.

## Documentation

See [PDQ Content Design](../../../../../../../wiki/PDQ-Content-Design) in the project wiki

## Dependencies
* `pdq_core` for PDQ workflow and PDQ-shared field definitions.
* `cgov_core` for general CancerGov-shared field definitions.

## Testing
**NOTE:** General information about running tests and project structure can be found in the root [TESTING.md](../../../../../../../TESTING.md) file. Please refer to that before reading further.

### Unit Tests

### Functional Tests
Loads the editing user interface through a web browser (using `Drupal\Tests\BrowserTestBase`) and tests whether the expected fields are present in the rendered UI.

#### Adding Fields

New fields should be added to [PDQDrugSummaryTest.php](tests/src/Functional/PDQSummaryTest.php) with their existence tested in `testSummaryFieldsExist()`.

Field presence tests require the ID of the UI element from the editing page. These names are based on the field's machine name, the exact rules for generating the filed name varies according to the field type (e.g. the "Short Title" input field has the ID `edit-field-short-title-0-value`. The "Posted Date" date selector has the ID `edit-field-date-posted-0-value-date`). The field names can most easily be found by loading the page and inspecting the HTML.
