Feature: Perform all Behat Content Workflow tasks using Cypress

    Scenario: Simple Workflow Enabled - Blocks
        And I should see "Draft" and "Published" when I navigate to the following urls while logged in with the following users
            | URLs                          | users         |
            | block/add/content_block       | simple_blocks |
            | block/add/raw_html_block      | simple_blocks |

    Scenario: Deprecated carousels are absent from the Custom Block Library add menu
        Given user logs in with a role "simple_blocks"
        When user navigates to "/block/add"
        Then I should not see a link to "/block/add/cgov_image_carousel"
        And I should not see a link to "/block/add/cgov_video_carousel"
        And I should see a link to "/block/add/content_block"
        And I should see a link to "/block/add/raw_html_block"
        And I should see a link to "/block/add/cgov_external_link_block"
        And I should see a link to "/block/add/ncids_mega_menu_content"

    Scenario: Deprecated carousels are absent from the Custom Block Library filter
        Given user logs in with a role "simple_blocks"
        When user navigates to "/admin/content/block"
        Then the Block type filter should not contain the following options
            | option              |
            | cgov_image_carousel |
            | cgov_video_carousel |
        And the Block type filter should contain the following options
            | option                   |
            | content_block            |
            | raw_html_block           |
            | cgov_external_link_block |
            | ncids_mega_menu_content  |

    Scenario: Deprecated carousels are absent from the legacy WYSIWYG block browser
        Given user logs in with a role "editorial_nodes_1"
        When user navigates to "/node/add/cgov_application_page"
        And user opens the "Insert Block Content" WYSIWYG block browser
        Then the entity browser Block type filter should not contain the following options
            | option              |
            | cgov_image_carousel |
            | cgov_video_carousel |
        And the entity browser Block type filter should contain the following options
            | option                   |
            | content_block            |
            | raw_html_block           |
            | cgov_external_link_block |
            | ncids_mega_menu_content  |

    Scenario: Deprecated carousels are absent from the NCIDS WYSIWYG block browser
        Given user logs in with a role "simple_blocks"
        When user navigates to "/node/add/cgov_biography"
        And user opens the "Insert Content Block Content" WYSIWYG block browser
        Then the entity browser Block type filter should not contain the following options
            | option              |
            | cgov_image_carousel |
            | cgov_video_carousel |
        And the entity browser Block type filter should contain the following options
            | option         |
            | content_block  |
            | raw_html_block |
