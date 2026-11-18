Feature: SAML user forms and Drupal login errors

    Scenario: Creating and saving users maintains their SAML mappings
        Given a dedicated SAML administrator
        When the administrator creates a user without password fields
        Then the new user has a SAML mapping
        When the administrator removes the mapping and saves the user without password fields
        Then the new user has a SAML mapping

    Scenario Outline: Missing credentials produce an accessible generic error
        When a visitor submits the Drupal login form with "<credentials>"
        Then the login form shows the accessible generic credential error

        Examples:
            | credentials   |
            | neither field |
            | username only |
            | password only |

    Scenario: The login action retains the bypass and destination parameters
        Then the Drupal login action preserves its query parameters
