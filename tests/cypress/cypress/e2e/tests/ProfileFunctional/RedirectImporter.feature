Feature: Import redirects from a CSV upload

    Scenario: Process English and Spanish redirects through the import queue
        Given a dedicated redirect administrator
        When the administrator uploads the redirect CSV
        Then one redirect import is queued
        When the redirect import queue is processed
        Then the redirect import queue is empty
        And all five imported URLs redirect to their expected destinations
