Feature: PDQ APIs on the shared installed site

    Scenario: Cancer summaries retain revisions, translations, navigation, and publication behavior
        Given dedicated PDQ importer and taxonomy administrator accounts
        And the orphaned PDQ summary sections have been pruned
        Then creating the Spanish summary before English is rejected
        When the English cancer summary is imported
        Then the English summary is stored as an unpublished node
        When the English cancer summary is revised
        Then the English summary is stored as an unpublished node
        When the Spanish cancer summary is added to the same node
        Then both summary translations are stored unpublished
        And summary site sections have not been created
        When both cancer summary translations are published
        Then both summary translations are stored published
        And both public summaries and their aliases match
        And both generated site section hierarchies match the summaries
        When the English navigation label is revised without publication
        Then the English site section retains its published label
        When the English cancer summary is published
        Then the English site section uses the revised label
        And the PDQ catalog describes both summary translations
        When revised English and Spanish titles are published
        Then both public summaries show the revised titles
        And deleting English before Spanish is rejected
        When the Spanish and English summaries are deleted in order
        Then pruning removes exactly the summary sections created by this lifecycle

    Scenario: The glossifier finds the expected Spanish terms and character offsets
        Given a dedicated glossifier importer and an ordinary authenticated user
        When the seven-term glossary is refreshed through the API
        Then the Spanish fragment produces all seven expected glossary matches
