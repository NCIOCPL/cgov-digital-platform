Feature: Cancer Research

    Scenario: Create cgov_cancer_research
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Cancer Research List Page" content type
        Then page title is "Create Cancer Research List Page"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                                        | field_name             |
            | Pretty URL       | cancer-research-list-page                    | field_pretty_url       |
            | Page Title       | Cancer Research List Page                    | title                  |
            | Browser Title    | Cancer Research List Page                    | field_browser_title    |
            | Meta Description | Cancer Research List Page - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page