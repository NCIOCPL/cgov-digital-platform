<?php

namespace Drupal\cgov_yaml_content\FieldProcessor;

use Drupal\yaml_content\ContentLoader\ContentLoader;

/**
 * Expose protected class methods.
 *
 * Unfortunately, the ContentLoader for yaml_content
 * does not directly expose the function necessary
 * for handling the #process directives, we have to
 * resort to this extension to bypass it's public
 * wrapper functions (they cause issues with paragraphs
 * and entity revisions).
 */
class FieldProcessor extends ContentLoader {

  /**
   * Public wrapper of protected fn.
   *
   * @param object $field
   *   The entity field object.
   * @param array|string $field_data
   *   The field data.
   */
  public function processFieldData($field, &$field_data) {
    parent::preprocessFieldData($field, $field_data);
  }

}
