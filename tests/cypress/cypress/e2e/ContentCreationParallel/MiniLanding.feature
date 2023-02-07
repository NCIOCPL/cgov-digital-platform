Feature: mini landing

    Scenario: Create cgov_mini_landing
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Mini Landing Page" content type
        Then page title is "Create Mini Landing Page"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                           | field_name             |
            | Pretty URL       | mini-landing                    | field_pretty_url       |
            | Page Title       | Mini Landing                    | title                  |
            | Browser Title    | Mini Landing                    | field_browser_title    |
            | Meta Description | Mini Landing - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page
