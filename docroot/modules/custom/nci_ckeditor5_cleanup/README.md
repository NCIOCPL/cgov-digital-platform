# NCI CKEditor5 Cleanup

This module provides additional cleanup options for CKEditor5 editors in Drupal 10.4+.

## Features

- **Clean Styles**: Removes unwanted style attributes from content pasted or entered into CKEditor5 fields.

## Installation (for non-cgov digital platform)

1. Place this module in your `modules` directory
2. Enable the module via Drush: `drush en nci_ckeditor5_cleanup`
3. Or enable via the admin interface at `/admin/modules`

## Configuration

1. Go to `/admin/config/content/formats`
2. Edit any text format that uses CKEditor5
3. In the "NCI CKEditor5 Cleanup" section, configure the cleanup options:
   - **Clean Styles**: Check to enable removal of unwanted style attributes

## Usage

Once configured, the cleanup options will automatically apply to content entered or pasted into CKEditor5 instances using the configured text format.

## Technical Details

The module works by:

1. Adding third-party settings to CKEditor5 text format configurations
2. Using `hook_editor_js_settings_alter()` to modify the CKEditor5 JavaScript configuration
3. Providing JavaScript behaviors that integrate with CKEditor5 to perform the actual cleanup

## Development

The module includes:

- **CleanupManager service**: Handles the processing of cleanup settings
- **Configuration schema**: Defines the structure for third-party settings
- **JavaScript behaviors**: Frontend integration with CKEditor5
- **Form alterations**: Adds configuration options to text format forms
