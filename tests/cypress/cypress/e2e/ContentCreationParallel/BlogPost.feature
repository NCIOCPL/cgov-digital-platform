Feature: blog post

    Scenario: Create cgov_blog_post
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Blog Post" content type
        Then page title is "Create Blog Post"
        And user selects "Blog Series" from Blog Series dropdown
        And user fills out the following fields
            | fieldLabel       | value                                   | field_name             |
            | Page Title       | Blog Post                               | title                  |
            | Pretty URL       | blog-post                               | field_pretty_url       |
            | Browser Title    | Blog Post                               | field_browser_title    |
            | Card Title       | Automated Test Blog Series - Card Title | field_card_title       |
            | Meta Description | Blog Post - Meta Description            | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page