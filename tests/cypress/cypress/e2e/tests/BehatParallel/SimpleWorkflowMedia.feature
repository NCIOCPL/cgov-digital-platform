Feature: Perform all Behat Content Workflow tasks using Cypress

    Scenario: Simple Workflow Enabled - Media
        And I should see "Draft" and "Published" when I navigate to the following urls while logged in with the following users
            | URLs                            | users        |
            | media/add/cgov_image            | simple_media |
            | media/add/cgov_contextual_image | simple_media |