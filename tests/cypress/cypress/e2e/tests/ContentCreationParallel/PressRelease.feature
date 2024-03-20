Feature: Press release

    Scenario: Create cgov_press_release
        When user logs in with a role "simple_blocks"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Press Release" content type
        Then page title is "Create Press Release"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                             | field_name             |
            | Pretty URL       | press-release                     | field_pretty_url       |
            | Page Title       | Press Release                     | title                  |
            | Browser Title    | Press Release                     | field_browser_title    |
            | Meta Description | Press Release  - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page
