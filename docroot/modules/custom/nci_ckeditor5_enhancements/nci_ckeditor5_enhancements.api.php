<?php

/**
 * @file
 * Hooks provided by the NCI CKEditor5 Enhancements module.
 */

use Drupal\editor\EditorInterface;

/**
 * Allows modules to alter the CSS class for a given text editor.
 *
 * @param array &$css_classes
 *   The list of CSS classes for the text editor.
 * @param \Drupal\editor\EditorInterface $editor
 *   The editor object.
 */
function hook_nci_ckeditor5_enhancements_editor_css_classes_alter(
  array &$css_classes,
  EditorInterface $editor,
) {
  // Example: Add a CSS class for the specific editor.
  if ($editor->id() === 'custom_format') {
    $css_classes[] = 'custom-text-format';
  }
}
