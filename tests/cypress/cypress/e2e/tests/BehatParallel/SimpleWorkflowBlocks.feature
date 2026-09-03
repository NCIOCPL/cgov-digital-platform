Feature: Perform all Behat Content Workflow tasks using Cypress

    Scenario: Simple Workflow Enabled - Blocks
        And I should see "Draft" and "Published" when I navigate to the following urls while logged in with the following users
            | URLs                          | users         |
            | block/add/content_block       | simple_blocks |
            | block/add/raw_html_block      | simple_blocks |

    Scenario: Deprecated carousels are absent from the Custom Block Library menus
        Given user logs in with a role "simple_blocks"
        When user navigates to "/block/add"
        Then I should not see a link to "/block/add/cgov_image_carousel"
        And I should not see a link to "/block/add/cgov_video_carousel"
        And I should see a link to "/block/add/content_block"
