Feature: Perform tasks related to PDQ Import

  Scenario: Ability to Translate Content
    And I should see "Draft" and "Published" when I navigate to the following urls while logged in with the following users
      | URLs                                    | users    |
      | node/add/pdq_cancer_information_summary | pdq_user |
      | node/add/pdq_drug_information_summary   | pdq_user |