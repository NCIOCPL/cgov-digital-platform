Feature: Perform all Behat Content Workflow tasks using Cypress

    Scenario: Editorial Workflow Enabled on Media
        And I should see "Draft" and "Review" when I navigate to the following urls while logged in with the following users
            | URLs                       | users             |
            | media/add/cgov_infographic | editorial_nodes_2 |
            | media/add/cgov_video       | editorial_nodes_2 |
            | media/add/cgov_file        | editorial_nodes_2 |