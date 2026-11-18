Feature: Site section navigation APIs

    Scenario: Navigation endpoints handle valid and invalid section configurations
        Given dedicated navigation API fixtures
        Then section and mobile navigation require a published landing page and navigation root
        And the megamenu endpoint requires a published content block
