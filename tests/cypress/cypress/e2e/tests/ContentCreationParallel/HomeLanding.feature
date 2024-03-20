Feature: home landing

    Scenario: Create cgov_home_landing
        When user logs in with a role "simple_blocks"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Home and Landing" content type
        Then page title is "Create Home and Landing"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                               | field_name             |
            | Pretty URL       | home-landing                        | field_pretty_url       |
            | Page Title       | Home and Landing                    | title                  |
            | Browser Title    | Home and Landing                    | field_browser_title    |
            | Meta Description | Home and Landing - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page