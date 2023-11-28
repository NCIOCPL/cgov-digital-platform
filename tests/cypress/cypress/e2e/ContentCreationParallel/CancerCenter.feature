Feature: Cancer center

    Scenario: Create cgov_cancer_center
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Cancer Center" content type
        Then page title is "Create Cancer Center"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                             | field_name             |
            | Pretty URL       | cancer-center                     | field_pretty_url       |
            | Institution Name | Cancer Center                     | title                  |
            | Browser Title    | Cancer Center                     | field_browser_title    |
            | Meta Description | Cancer Center  - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page