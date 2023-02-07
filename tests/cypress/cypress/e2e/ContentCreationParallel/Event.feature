Feature: event

    Scenario: Create cgov_event
        When user logs in with a role "admin"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Event" content type
        Then page title is "Create Event"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                    | field_name             |
            | Pretty URL       | event                    | field_pretty_url       |
            | Event Title      | Event                    | title                  |
            | Browser Title    | Event                    | field_browser_title    |
            | Meta Description | Event - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page