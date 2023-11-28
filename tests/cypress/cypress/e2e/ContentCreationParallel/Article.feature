Feature: Create Article

    Scenario: Create cgov_article
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Article" content type
        Then page title is "Create Article"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                      | field_name             |
            | Pretty URL       | article                    | field_pretty_url       |
            | Page Title       | Article                    | title[0][value]        |
            | Browser Title    | Article                    | field_browser_title    |
            | Meta Description | Article - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page