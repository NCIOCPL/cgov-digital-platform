@smoke @regression
Feature: Perform tasks related to Content Translation
  In order to provide value to our users
  content authors should have the ability to translate content
  so that content can be available to non english speaking users.

  Background:
    Given I am logged in as a user with the "content_author,admin_ui" role

  @javascript @api @errors
  Scenario Outline: Ability to Translate Content
    Given I should be able to edit a "<Content Type>"
    Then I should see the text "Translate"

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
  Scenario: Ability to Create a Spanish Translation
    # Marking this as @TODO since default content isnt added to CI.
    # To fix this, may need to create sample taxonomy for site section.
    Given I should be able to edit a "cgov_article"
    Then I should see the text "Translate"
    And I click "Translate"
    And I click "Add"
    Then I should see the text "Crear traducción Spanish de"
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
