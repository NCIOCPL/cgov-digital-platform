Feature: Site can have basic setup.

    Scenario: Create users and add permissions
        # setup_user is only used when setting up the test environment and is not
        # intended for use in test scenarios.
        And user creates new user with username "setup_user"
        And user creates new user with username "editorial_nodes_1"
        And user creates new user with username "editorial_nodes_2"
        And user creates new user with username "editorial_nodes_3"
        And user creates new user with username "simple_media"
        And user creates new user with username "simple_blocks"
        And user creates new user with username "pdq_user"
        And user adds the following roles to the following users
            | roles           | users                                                                                                |
            | site_admin      | setup_user,editorial_nodes_1                                                                         |
            | admin_ui        | setup_user,editorial_nodes_1,editorial_nodes_2,editorial_nodes_3,simple_media,simple_blocks,pdq_user |
            | content_author  | setup_user,editorial_nodes_1,editorial_nodes_2,editorial_nodes_3,simple_media,simple_blocks          |
            | blog_manager    | setup_user,editorial_nodes_3                                                                         |
            | image_manager   | setup_user,simple_media                                                                              |
            | advanced_editor | setup_user,simple_blocks                                                                             |
            | pdq_importer    | pdq_user                                                                                             |

    Scenario: Create site section
        When user logs in with a role "setup_user"
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
