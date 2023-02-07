Feature: Perform all Behat Content Workflow tasks using Cypress

    Scenario: Simple Workflow Enabled - Blocks
        And I should see "Draft" and "Published" when I navigate to the following urls while logged in with the following users
            | URLs                          | users         |
            | block/add/content_block       | simple_blocks |
            | block/add/raw_html_block      | simple_blocks |
            | block/add/cgov_image_carousel | simple_blocks |
            | block/add/cgov_video_carousel | simple_blocks |
