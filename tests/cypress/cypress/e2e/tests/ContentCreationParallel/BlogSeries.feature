Feature: Create Blog Series

    Scenario: Create cgov_blog_series
        When user logs in with a role "setup_user"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Blog Series" content type
        Then page title is "Create Blog Series"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                                   | field_name             |
            | Page Title       | Blog Series                             | title                  |
            | Pretty URL       | blog-series                             | field_pretty_url       |
            | Browser Title    | Blog Series                             | field_browser_title    |
            | Card Title       | Automated Test Blog Series - Card Title | field_card_title       |
            | Meta Description | Blog Series- Meta Description           | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page