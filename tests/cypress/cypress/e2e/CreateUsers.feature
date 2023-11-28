Feature: Set up users and roles for behat

    Scenario: Create users and add permissions
        And user creates new user with username "editorial_nodes_1"
        And user creates new user with username "editorial_nodes_2"
        And user creates new user with username "editorial_nodes_3"
        And user creates new user with username "simple_media"
        And user creates new user with username "simple_blocks"
        And user creates new user with username "pdq_user"
        And user adds the following roles to the following users
            | roles           | users                                                                                     |
            | site_admin      | editorial_nodes_1                                                                         |
            | admin_ui        | editorial_nodes_1,editorial_nodes_2,editorial_nodes_3,simple_media,simple_blocks,pdq_user |
            | content_author  | editorial_nodes_1,editorial_nodes_2,editorial_nodes_3,simple_media,simple_blocks          |
            | blog_manager    | editorial_nodes_3                                                                         |
            | image_manager   | simple_media                                                                              |
            | advanced_editor | simple_blocks                                                                             |
            | pdq_importer    | pdq_user                                                                                  |