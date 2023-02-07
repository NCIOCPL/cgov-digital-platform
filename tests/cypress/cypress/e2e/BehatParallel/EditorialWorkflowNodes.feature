Feature: Perform all Behat Content Workflow tasks using Cypress

    Scenario: Editorial Workflow Enabled on Nodes
        And I should see "Draft" and "Review" when I navigate to the following urls while logged in with the following users
            | URLs                           | users             |
            | node/add/cgov_application_page | editorial_nodes_1 |
            | node/add/cgov_article          | editorial_nodes_2 |
            | node/add/cgov_biography        | editorial_nodes_2 |
            | node/add/cgov_blog_post        | editorial_nodes_2 |
            | node/add/cgov_blog_series      | editorial_nodes_3 |
            | node/add/cgov_cancer_research  | editorial_nodes_2 |
            | node/add/cgov_cancer_center    | editorial_nodes_2 |
            | node/add/cgov_event            | editorial_nodes_2 |
            | node/add/cgov_home_landing     | editorial_nodes_2 |
            | node/add/cgov_mini_landing     | editorial_nodes_2 |
            | node/add/cgov_press_release    | editorial_nodes_2 |