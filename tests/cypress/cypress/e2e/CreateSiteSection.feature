Feature: Create test site section

    Scenario: Create site section
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        When user clicks on "Structure" tab
        And user clicks on "Taxonomy" sub tab
        And user selects "List terms" option from Operations for "Site Sections"
        And user clicks on "Add term" action button
        Then page title is "Add term"
        And user fills out the following fields
            | fieldLabel | value             | field_name                 |
            | Name       | Test              | name[0][value]             |
            | Pretty URL | test-site-section | field_pretty_url[0][value] |
        And user checks "Set Main Nav Root" checkbox to set section
        And user checks "Set Breadcrumb Root" checkbox to set section
        Then user saves the content page