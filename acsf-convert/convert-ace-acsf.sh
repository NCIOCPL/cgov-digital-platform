#!/bin/sh
## Please run this file from your root directory. You should execute
## the command "./acsf-convert/convert-ace-acsf.sh"

## Remove ACE Hooks
rm -rf hooks

## Setup Factory Hooks
cp -R acsf-convert/files/factory-hooks/ ./factory-hooks
cp -R acsf-convert/files/hooks/ ./hooks

## Copy in ACSF Management Site
cp -R acsf-convert/files/docroot/sites/g ./docroot/sites/

## Copy new Sites Folder
cp acsf-convert/files/docroot/sites/sites.php ./docroot/sites/sites.php
cp acsf-convert/files/docroot/sites/default/acsf.settings.php ./docroot/sites/default/acsf.settings.php

## Copy drupal users seed
cp acsf-convert/files/cgov-drupal-users.yml ./cgov-drupal-users.yml
