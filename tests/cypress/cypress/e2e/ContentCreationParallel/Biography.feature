Feature: Create biography

    Scenario: Create cgov_biography
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Biography" content type
        Then page title is "Create Biography"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                        | field_name             |
            | Pretty URL       | biography                    | field_pretty_url       |
            | Full Name        | Full Name                    | title[0][value]        |
            | Browser Title    | Biography                    | field_browser_title    |
            | Meta Description | Biography - Meta Description | field_page_description |
            | First Name       | FirstName                    | field_first_name       |
            | Last Name        | LastName                     | field_last_name        |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page