@smoke @regression
Feature: Perform tasks related to a Content Editor
  As a content editor
  I want the ability to publish content in the CMS
  so that I can make it available to external users.

  Background:
    Given I am logged in as a user with the "content_author,content_editor,admin_ui" role


  @javascript @api @errors
  Scenario Outline: Use Workflow Transitions
    # Tests that Content Moderation is enabled.
    Given I should be able to edit a "<Content Type>"
    And I should see "Draft" in the "#edit-moderation-state-0-state" element
    And I should see "Review" in the "#edit-moderation-state-0-state" element

    Examples:
      | Content Type                   |
      | cgov_article                   |
      | cgov_biography                 |
#      | cgov_blog_post     |
#      | cgov_blog_series   |
      | cgov_cancer_center             |
      | cgov_event                     |
      | cgov_home_landing              |
      | cgov_mini_landing              |
      | cgov_press_release             |

  @javascript @api @errors @todo
  Scenario: Ability to move an item through all workflow states
    # Tests that all workflow states exist and are transitionable.
    # TODO: Implement for Article.
