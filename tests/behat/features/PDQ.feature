@smoke @regression @todo
Feature: Perform tasks related to PDQ Import
  In order to utilize the PDQ importer
  the system must allow PDQ items to be created and translated
  so that the migration system can import PDQ elements.

  Background:
    Given I am logged in as a user with the "pdq_importer,admin_ui" role


  @javascript @api @errors
  Scenario Outline: Ability to Translate Content
    Given I should be able to edit a "<Content Type>"
    Then I should see the text "Translate"

    Examples:
      | Content Type                   |
      | pdq_cancer_information_summary |
      | pdq_drug_information_summary   |


  @javascript @api @errors @todo
  Scenario: Ability to move an item through all workflow states
    # PDQ Items have unique workdlows. Test it here.
    # TODO: Implement for PDQ Summary.
