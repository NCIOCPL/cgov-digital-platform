@smoke @regression @javascript @api
Feature: Perform tasks related to Content Translation
  In order to provide value to our users
  content authors should have the ability to translate content
  so that content can be available to non english speaking users.

  Scenario Outline: Ability to Translate Content
    Given I am logged in as a user with the "<Roles>" roles
    And I should be able to edit a "<Content Type>"
    Then I should see the text "Translate"

    Examples:
      | Content Type                   | Roles                                        |
      | cgov_article                   | content_author,admin_ui         |
      | cgov_biography                 | content_author,admin_ui         |
      | cgov_blog_post                 | content_author,admin_ui         |
      | cgov_blog_series               | blog_manager,content_author,admin_ui         |
      | cgov_cancer_center             | content_author,admin_ui         |
      | cgov_event                     | content_author,admin_ui         |
      | cgov_home_landing              | content_author,admin_ui         |
      | cgov_mini_landing              | content_author,admin_ui         |
      | cgov_press_release             | content_author,admin_ui         |

  @todo
  Scenario: Ability to Create a Spanish Translation
    # Marking this as @TODO since default content isnt added to CI.
    # To fix this, may need to create sample taxonomy for site section.
    Given I am logged in as a user with the "content_author,admin_ui" role
    And I should be able to edit a "cgov_article"
    Then I should see the text "Translate"
    And I click "Translate"
    And I click "Add"
    Then I should see the text "Create Spanish translation"
    And I press "field_site_section_entity_browser_entity_browser"
    And I wait for AJAX to finish
    When I enter the "entity_browser_iframe_cgov_site_section_browser" frame
    And I check "edit-entity-browser-select-taxonomy-term40"
    And I press "edit-submit"
    And I wait for AJAX to finish
    And I switch to main window
    And I fill in "title[0][value]" with "Test123"
    And I fill in "field_browser_title[0][value]" with "Test123"
    And I fill in "field_page_description[0][value]" with "Test123"
    And I press the "edit-submit" button
    Then I should see the text "ha sido actualizado."
