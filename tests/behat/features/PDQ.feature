@smoke @regression @pdq
Feature: Perform tasks related to PDQ Import
  In order to utilize the PDQ importer
  the system must allow PDQ items to be created and translated
  so that the migration system can import PDQ elements.

  Background:
    Given I am logged in as a user with the "pdq_importer,admin_ui" role


  @javascript @api @todo
  Scenario Outline: Ability to Translate Content
    Given I should be able to edit a "<Content Type>"
    Then I fill in the text "Translate"

    Examples:
      | Content Type                   |
      | pdq_cancer_information_summary |
      | pdq_drug_information_summary   |

  @javascript @api @errors
  Scenario: Validate fields on PDQ Cancer Summary
    Given I should be able to edit a "pdq_cancer_information_summary"
    Then I fill in "Title" with "Test Title"
    Then I fill in "Browser Title" with "Test Browser Title"
    Then I fill in "CDR ID" with "1234"
    Then I fill in "Summary Type" with "genetics"
    Then I fill in "edit-field-date-posted-0-value-date" with "01/01/2019"
    Then I fill in "edit-field-date-updated-0-value-date" with "01/01/2019"
    Then I fill in "Meta Description" with "Test Description"
    Then I fill in "Public Use" with "display"
    Then I fill in "Audience" with "Patients"
    Then I press "Add PDQ Summary Section"
    And I wait for AJAX to finish
    Then I fill in "Section ID" with "Test 1"
    Then I fill in "Section Title" with "Test 2"
    Then I fill in "Section HTML" with "Test 3"
    Then I fill in "PDQ Summary URL" with "/pdq/testpage"
    Then press "Save"

  @javascript @api @errors
  Scenario: Validate fields on PDQ Drug Information Summary
    Given I should be able to edit a "pdq_drug_information_summary"
    Then I fill in "Title" with "Test Title"
    Then I fill in "CDR ID" with "1234"
    Then I fill in "edit-field-date-posted-0-value-date" with "01/01/2019"
    Then I fill in "edit-field-date-updated-0-value-date" with "01/01/2019"
    Then I fill in "Meta Description" with "Test Description"
    Then I fill in "Body" with "Lorem Ipsum"
    Then I fill in "Pronunciation Audio ID" with "Audio ID"
    Then I fill in "Pronunciation Key" with "Audio Key"
    Then I fill in "Public Use" with "display"
    Then I fill in "PDQ Summary URL" with "/pdq/testpage"
    Then press "Save"

  @javascript @api @errors @todo
  Scenario: Ability to move an item through all workflow states
    # PDQ Items have unique workdlows. Test it here.
    # TODO: Implement for PDQ Summary.
