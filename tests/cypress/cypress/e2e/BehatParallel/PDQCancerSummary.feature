Feature: Perform tasks related to PDQ Import

  Scenario: Validate fields on PDQ Cancer Summary
    When user logs in with a role "pdq_user"
    Given user navigates to "node/add/pdq_cancer_information_summary"
    And user fills out the following fields
      | fieldLabel       | value              | field_name                         |
      | Title            | Test Title         | title[0][value]                    |
      | Browser Title    | Test Browser Title | field_browser_title                |
      | CTHP Card Title  | Test Card Title    | field_cthp_card_title              |
      | CDR ID           | 1234               | field_pdq_cdr_id                   |
      | Meta Description | Test Description   | field_page_description             |
      | Date             | 2023-06-08         | field_date_posted[0][value][date]  |
      | Date             | 2023-06-08         | field_date_updated[0][value][date] |
      | PDQ Summary URL  | /pdq/testpage      | field_pdq_url                      |
    And user selects "Genetics" from "Summary Type" dropdown
    And user selects "Display" from "Public Use" dropdown
    And user selects "Patients" from "Audience" dropdown
    And user fills out the following fields
      | fieldLabel    | value  | field_name                                                            |
      | Section ID    | Test 1 | field_summary_sections[0][subform][field_pdq_section_id][0][value]    |
      | Section Title | Test 2 | field_summary_sections[0][subform][field_pdq_section_title][0][value] |
    And user fills out "Section HTML" with "Test 3"
    Then user saves the content page
