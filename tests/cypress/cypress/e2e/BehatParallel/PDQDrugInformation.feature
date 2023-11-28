Feature: Perform tasks related to PDQ Import

  Scenario: Validate fields on PDQ Drug Information Summary
    When user logs in with a role "pdq_user"
    Given user navigates to "node/add/pdq_drug_information_summary"
    And user fills out the following fields
      | fieldLabel             | value              | field_name                         |
      | Title                  | Test Title         | title[0][value]                    |
      | Browser Title          | Test Browser Title | field_browser_title                |
      | CDR ID                 | 1234               | field_pdq_cdr_id                   |
      | Date                   | 2023-06-08         | field_date_posted[0][value][date]  |
      | Date                   | 2023-06-08         | field_date_updated[0][value][date] |
      | Meta Description       | Test Description   | field_page_description             |
      | PDQ Summary URL        | /pdq/testpage      | field_pdq_url                      |
      | Pronunciation Audio ID | Audio ID           | field_pdq_audio_id                 |
      | Pronunciation Key      | Audio Key          | field_pdq_pronunciation_key        |
    And user fills out "Body" with "Lorem Ipsum"
    And user selects "Posted Date" checkbox
    And user selects "Reviewed Date" checkbox
    And user selects "Display" from "Public Use" dropdown
    And user selects "Published" from "Save as" dropdown
    Then user saves the content page

