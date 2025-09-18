# NCI CKEditor 5 Enhancements

A Drupal 10.4 module that provides a collection of small CKEditor 5 plugins for enhanced text editing functionality.

## Overview

The NCI CKEditor 5 Enhancements module extends CKEditor 5 with custom plugins specifically designed for the NCI (National Cancer Institute) content management needs. This module provides enhanced CSS targeting capabilities for text formats, allowing for better styling control and customization of the CKEditor 5 editing experience.

## Features

### Text Format CSS Targeting Plugin

This plugin automatically adds CSS classes and data attributes to CKEditor 5 instances based on the text format being used. This enables:

- **Format-specific styling**: Apply different styles based on the text format
- **Improved CSS targeting**: More precise CSS selectors for editor content
- **Extensible class system**: Allows other modules to add their own CSS classes through hooks

## Requirements

- Drupal 10.4 or higher
- CKEditor 5 module
- Editor module
- Filter module

## Installation

1. Place the module in your `modules/custom` directory
2. Enable the module using Drush or the admin interface:
   ```bash
   drush en nci_ckeditor5_enhancements
   ```

## Configuration

### Adding the Plugin to Text Formats

1. Navigate to **Configuration > Content authoring > Text formats and editors**
2. Edit the desired text format
3. In the CKEditor 5 toolbar configuration, the Text Format CSS Targeting plugin is automatically available
4. The plugin will automatically add CSS classes in the format `ck-content--{text_format_id}`

### Available CSS Classes

The plugin automatically adds the following CSS classes to the CKEditor 5 editing area:

- `ck-content--{format_id}`: Where `{format_id}` is the machine name of the text format with underscores replaced by hyphens

### Data Attributes

The plugin also adds the following data attribute to the editor wrapper:

- `data-text-format="{format_id}"`: Contains the machine name of the text format

## Development

### Prerequisites

- Node.js and npm
- Webpack
- Jest for testing

### Building the JavaScript

The module uses Webpack to build CKEditor 5 plugins:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode for development
npm run watch
```

### Testing

The module includes Jest tests for JavaScript components:

```bash
# Run tests with coverage
npm test
```

Coverage threshold is set to 85% line coverage.

### Project Structure

```
nci_ckeditor5_enhancements/
├── js/
│   ├── build/                          # Built JavaScript files
│   └── ckeditor5_plugins/
│       └── text_format_css_targeting/  # Plugin source code
│           └── src/
│               ├── index.js            # Plugin entry point
│               └── text-format-css-targeting.js  # Main plugin class
├── src/
│   └── Plugin/
│       └── CKEditor5Plugin/
│           └── TextFormatCssTargeting.php  # Drupal plugin class
├── nci_ckeditor5_enhancements.api.php     # Hook documentation
├── nci_ckeditor5_enhancements.ckeditor5.yml  # CKEditor 5 plugin definition
├── nci_ckeditor5_enhancements.info.yml    # Module info
├── nci_ckeditor5_enhancements.libraries.yml  # Drupal libraries
├── package.json                        # Node.js dependencies
├── webpack.config.js                   # Build configuration
└── jest.config.js                      # Test configuration
```

## API

### Hooks

#### hook_nci_ckeditor5_enhancements_editor_css_classes_alter()

Allows other modules to add custom CSS classes to specific text formats.

```php
/**
 * Implements hook_nci_ckeditor5_enhancements_editor_css_classes_alter().
 */
function mymodule_nci_ckeditor5_enhancements_editor_css_classes_alter(
  array &$css_classes,
  EditorInterface $editor,
) {
  // Add custom class for specific format
  if ($editor->id() === 'full_html') {
    $css_classes[] = 'custom-full-html-editor';
  }
}
```

### Plugin Configuration

The plugin automatically configures itself with:

```javascript
{
  text_format_css_targeting: {
    css_classes: ['ck-content--{format-id}', ...],
    format: '{format_id}'
  }
}
```

## CSS Styling Examples

You can target specific text formats in your CSS:

```css
/* Style the editing area for a specific text format */
.ck-content.ck-content--full-html {
  font-family: 'Custom Font', sans-serif;
}

/* Target the editor wrapper */
[data-text-format="full_html"] .ck-editor__editable {
  border: 2px solid #007bff;
}

/* Style specific elements within certain formats */
.ck-content--basic-html h2 {
  color: #dc3545;
}
```
