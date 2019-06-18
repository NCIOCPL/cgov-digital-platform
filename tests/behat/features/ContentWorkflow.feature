@smoke @regression @javascript @api
Feature: Perform tasks related to a Content Editor
  As a content editor
  I want the ability to publish content in the CMS
  so that I can make it available to external users.

  Scenario Outline: Editorial Workflow Enabled on Nodes
    # Tests that Content Moderation is enabled.
    Given I am logged in as a user with the "<Roles>" roles
    And I should be able to edit a "<Content Type>"
    Then I should see "Draft" in the "#edit-moderation-state-0-state" element
    And I should see "Review" in the "#edit-moderation-state-0-state" element

    Examples:
      | Content Type                   | Roles                                        |
      | cgov_application_page          | site_admin,content_author,admin_ui         |
      | cgov_article                   | content_author,admin_ui         |
      | cgov_biography                 | content_author,admin_ui         |
      | cgov_blog_post                 | content_author,admin_ui         |
      | cgov_blog_series               | blog_manager,content_author,admin_ui         |
      | cgov_cancer_research           | content_author,admin_ui         |
      | cgov_cancer_center             | content_author,admin_ui         |
      | cgov_event                     | content_author,admin_ui         |
      | cgov_home_landing              | content_author,admin_ui         |
      | cgov_mini_landing              | content_author,admin_ui         |
      | cgov_press_release             | content_author,admin_ui         |

  Scenario Outline: Editorial Workflow Enabled on Media
    # Tests that Content Moderation is enabled.
    Given I am logged in as a user with the "<Roles>" roles
    And I am on "<URL>"
    Then I should see "Draft" in the "#edit-moderation-state-0-state" element
    And I should see "Review" in the "#edit-moderation-state-0-state" element

  Examples:
    | URL                            | Roles                           |
    | /media/add/cgov_infographic               | content_author,admin_ui         |
    | /media/add/cgov_video                     | content_author,admin_ui         |
    | /media/add/cgov_file                      | content_author,admin_ui         |

  Scenario Outline: Simple Workflow Enabled - Media
    # Tests that Content Moderation is enabled.
    Given I am logged in as a user with the "<Roles>" roles
    And I am on "<URL>"
    Then I should see "Draft" in the "#edit-moderation-state-0-state" element
    And I should see "Published" in the "#edit-moderation-state-0-state" element

    Examples:
      | URL                                       | Roles                                         |
      | /media/add/cgov_image                     | image_manager,content_author,admin_ui         |
      | /media/add/cgov_contextual_image          | image_manager,content_author,admin_ui         |

  Scenario Outline: Simple Workflow Enabled - Blocks
    # Tests that Content Moderation is enabled.
    Given I am logged in as a user with the "<Roles>" roles
    And I am on "<URL>"
    Then I should see "Draft" in the "#edit-moderation-state-0-state" element
    And I should see "Published" in the "#edit-moderation-state-0-state" element

    Examples:
      | URL                                       | Roles                                           |
      | /block/add/content_block                  | advanced_editor,content_author,admin_ui         |
      | /block/add/raw_html_block                 | advanced_editor,content_author,admin_ui         |
      | /block/add/cgov_image_carousel            | advanced_editor,content_author,admin_ui         |
      | /block/add/cgov_video_carousel            | advanced_editor,content_author,admin_ui         |
