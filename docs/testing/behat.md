# Behat Testing
Created by: John Doyle\
Last Updated: 3/29/2019


## Overview
This document is meant to provide a guideline for writing Behat tests. 

## Preliminary Reading
1. [Overview of BDD](https://docs.cucumber.io/bdd/overview/)
2. [Introduction to Behat](http://docs.behat.org/en/v2.5/quick_intro.html)
3. [Writing Features in Gherkin](http://docs.behat.org/en/v2.5/guides/1.gherkin.html)
4. [Behat Drupal Extension - Drupal API](https://behat-drupal-extension.readthedocs.io/en/3.1/drupalapi.html)

## Behat Test Development Fundamentals
For the purposes of this project specifically, we want to implement some design patterns to ensure consistency and quality on the project. 

### Behat Test Development
Behat tests should be developed to:
 1. Test custom user behaviors on the website.
 2. Test custom user workflows built for the website.
 3. Test custom user interactions on the website.
 
 Behat tests should NOT:
 1. Validate field mappings/definitions.
 2. Validate front-end markup or display.
 3. Validate content existence or placement.
 
In order to streamline efficiencies with tests and reduce redundant steps/execution time, scenarios should be built with the larger picture in mind.   
 
 
## Drupal Context
BLT integrates the Drupal Extension into Behat that create step definitions for basic scenarios in Behat for testing with Drupal. When writing tests, you should start with functionality provided by the Drupal Extension, and only if required, build out new step definitions. 

You can run `blt tbd` at any time to see the step definitions that you get out of the box! 
### Step Definition Overview
There are 3 basic identifiers for step definitions and they follow a similar pattern to user stories. For examples, read more here: [Writing Features in Gherkin](http://docs.behat.org/en/v2.5/guides/1.gherkin.html)

#### Given
The purpose of Given steps is to put the system in a known state before the user (or external system) starts interacting with the system (in the When steps). Avoid talking about user interaction in givens. If you have worked with use cases, givens are your preconditions.

#### When
The purpose of When steps is to describe the key action the user performs 

#### Then
The purpose of Then steps is to observe outcomes. The observations should be related to the business value/benefit in your feature description. The observations should inspect the output of the system (a report, user interface, message, command output) and not something deeply buried inside it (that has no business value and is instead part of the implementation).

### Step Definition Recommendations
- When you have a repetitive task being tested use a [Scenario Outline](http://docs.behat.org/en/v2.5/guides/1.gherkin.html#scenario-outlines)

## Tagging Features & Scenarios
Tagging is a way to organize scenarios and group them together. These tags allow groups of tests to be run together. An example of this could be '@smoke' and '@regression' to define scenarios that should be run to do a smoke test vs. a regression test.

### Tagging Methodologies
For this project, we will focus on two tag structures:
 1. Primary Tags - Primary tags will be utilized to differentiate runs. 
 2. Secondary Tags - Utilized to help group tests into relevant chunks based on ticket/epic organization. These are utilized to ensure coverage/run more specific tests.
 
#### Primary Tags
1. @smoke
2. @full-regression

#### Secondary Tags
1. @<epic> (ex. @NCI-Epic1)  
 
This tagging structure will allow us to run targeted tags depending on what is going on. Some use cases:
1. At the beginning of a sprint, CI could be configured to target only epic tags.
2. For Master branch PRs, a full-regression tag could be used.
3. For local testing, a @epic tag could be used.
