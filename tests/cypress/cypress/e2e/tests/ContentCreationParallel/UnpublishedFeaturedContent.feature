Feature: Create Article

    Scenario: Verify unpublished featured content is not displayed on FE
        When user logs in with a role "simple_blocks"
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Article" content type
        Then page title is "Create Article"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                        | field_name             |
            | Pretty URL       | article-1                    | field_pretty_url       |
            | Page Title       | Article-1                    | title[0][value]        |
            | Browser Title    | Article-1                    | field_browser_title    |
            | Meta Description | Article-1 - Meta Description | field_page_description |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page
        And message that "Article Article-1" has been created appears
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Article" content type
        Then page title is "Create Article"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                        | field_name             |
            | Pretty URL       | article-2                    | field_pretty_url       |
            | Page Title       | Article-2                    | title[0][value]        |
            | Browser Title    | Article-2                    | field_browser_title    |
            | Meta Description | Article-2 - Meta Description | field_page_description |
        Then user saves the content page
        And message that "Article Article-2" has been created appears
        Given user navigates to "/admin/content"
        Then user clicks on "Content" tab
        And user clicks on "Add content" action button
        And user clicks on "Home and Landing" content type
        Then page title is "Create Home and Landing"
        When user selects test site section
        And user fills out the following fields
            | fieldLabel       | value                                      | field_name             |
            | Pretty URL       | home-landing-promo-blocks                  | field_pretty_url       |
            | Page Title       | Home and Landing Unpublished Promo Blocks  | title                  |
            | Browser Title    | Home and Landing Unpublished  Promo Blocks | field_browser_title    |
            | Meta Description | Home and Landing - Meta Description        | field_page_description |
        And user selects "NCIDS without Title" from style dropdown
        And user selects "Add NCIDS Promo Block Internal" from content dropdown
        And browser waits
        And user selects "Light" theme for 1 block
        And user selects "Image Right" image position for 1 block
        And user clicks on "Featured Item" in "NCIDS Promo Block Internal" section
        And user clicks on "Select content" button item
        And user selects "Article-1" item from the list
        And user clicks on "Select content" button to select item
        And browser waits
        And user fills out the following fields
            | fieldLabel  | value       | field_name                                                      |
            | Button Text | Button Text | field_landing_contents[0][subform][field_button_text][0][value] |
        And user selects "Add NCIDS Promo Block Internal" from content dropdown
        And browser waits
        And user selects "Light" theme for 2 block
        And user selects "Image Right" image position for 2 block
        And user clicks on "Featured Item" in "NCIDS Promo Block Internal" section
        And user clicks on "Select content" button item
        And user selects "Article-2" item from the list
        And user clicks on "Select content" button to select item
        And browser waits
        And user fills out the following fields
            | fieldLabel  | value       | field_name                                                      |
            | Button Text | Button Text | field_landing_contents[1][subform][field_button_text][0][value] |
        And user selects "Published" from "Save as" dropdown
        Then user saves the content page
        And message that "Home and Landing Home and Landing Unpublished Promo Blocks" has been created appears
        And user logs out
        When user navigates to "test-site-section/home-landing-promo-blocks"
        Then only 1 promo block with link "/test-site-section/article-1" is displayed

