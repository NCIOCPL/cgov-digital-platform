Feature: Create Application Page

    Scenario: Create cgov_application_page
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Application Page" content type
        Then page title is "Create Application Page"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                               | field_name             |
            | Pretty URL       | application-page                    | field_pretty_url       |
            | Page Title       | Application Page                    | title[0][value]        |
            | Browser Title    | Application Page                    | field_browser_title    |
            | Meta Description | Application Page - Meta Description | field_page_description |
        And user selects "Clinical Trials Search App Module" from "Application Module" dropdown
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page