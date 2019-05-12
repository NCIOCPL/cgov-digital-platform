# Features Module - Configuration Management
The features module enables the capture and management of features in Drupal. A feature is a collection of Drupal entities which taken together satisfy a certain use-case.

Features provides a UI and API for taking different site building components from modules with exportables and bundling them together in a single feature module. A feature module is like any other Drupal module except that it contains additional information in its info file so that configuration can be checked, updated, or reverted programmatically.

**Module Link:**
 https://www.drupal.org/project/features

## Usage
Features will be used to manage configuration for "features" for the profile. This will provide a more streamlined way to export changes to configuration managed my your modules. The other benefit of features is that it will allow configuration updates to be imported once the repository moves from install to update. 

## Step for enabling features:
1. Add a new file to the module called \<modulename\>.features.yml
    1. This file should contain 1 line: `bundle: cgov`
2. Update <modulename>.info.yml and remove “CGov” from name
3. Change package to `package: 'Cgov Bundle'`
4. Clear Caches
5. Export new feature to sync config: `drush features:export <modulename>`
6. Review configuration changes and dependency updates. Resolve conflicts if circular dependencies are introduced. 
7. 
