<?php

/**
 * @file
 * Script to export cgov_site_section tree.
 */

use Drupal\taxonomy\TermInterface;
use Drupal\taxonomy\TermStorageInterface;

/** @var \Drupal\Core\Entity\EntityTermManagerInterface */
$entity_type_manager = \Drupal::service('entity_type.manager');

/** @var \Drupal\taxonomy\TermStorageInterface */
$term_storage = $entity_type_manager->getStorage('taxonomy_term');

$terms = $term_storage->loadByProperties([
  'vid' => 'cgov_site_sections',
  'parent' => 0,
]);

foreach ($terms as $term) {
  // @todo Open a file for writing.
  export_term($term, $term_storage);
}

/**
 * Exports a term, and it's children as a yaml_content file.
 *
 * @param \Drupal\taxonomy\TermInterface $term
 *   The term to export.
 * @param \Drupal\taxonomy\TermStorageInterface $term_storage
 *   The term storage.
 */
function export_term(TermInterface $term, TermStorageInterface $term_storage) {

  $serializer = \Drupal::service('serialization.yaml');

  $file = fopen(
    '/tmp/term-yaml' . $term->id() . '.yml',
    'w'
  );

  foreach (get_term_objects($term, $term_storage, NULL) as $yaml_content) {
    fwrite(
      $file,
      $serializer->encode([$yaml_content])
    );
  }

  fclose($file);
}

/**
 * Gets terms and their children as yaml_content for a term.
 *
 * This is a generator that will recurse and return child terms. This is done
 * this way because yaml_content needs terms to always have a parent.
 *
 * @param \Drupal\taxonomy\TermInterface $term
 *   The term to export.
 * @param \Drupal\taxonomy\TermStorageInterface $term_storage
 *   The term storage.
 * @param \Drupal\taxonomy\TermInterface|null $parent_term
 *   The parent term if it exists.
 */
function get_term_objects(
  TermInterface $term,
  TermStorageInterface $term_storage,
  ?TermInterface $parent_term
) {
  $content = [
    "tid" => $term->id(),
    "entity" => "taxonomy_term",
    "vid" => "cgov_site_sections",
    "langcode" => $term->language()->getId(),
    "name" => $term->getName(),
    "weight" => $term->getWeight(),
  ];

  $string_fields = [
    "field_navigation_label", "field_pretty_url", "field_levels_to_display",
    "field_channel", "field_content_group",
  ];

  foreach ($string_fields as $field_name) {
    $value_obj = get_string_field($term, $field_name);
    if ($value_obj !== NULL) {
      $content[$field_name] = $value_obj;
    }
  }

  $bool_fields = [
    "field_breadcrumb_root", "field_section_nav_root", "field_main_nav_root",
  ];

  foreach ($bool_fields as $field_name) {
    $value_obj = get_boolean_field($term, $field_name);
    if ($value_obj !== NULL) {
      $content[$field_name] = $value_obj;
    }
  }

  $multi_list_fields = ["field_navigation_display_options"];

  foreach ($multi_list_fields as $field_name) {
    $value_obj = get_multi_list_field($term, $field_name);
    if ($value_obj !== NULL) {
      $content[$field_name] = $value_obj;
    }
  }

  if ($parent_term !== NULL) {
    $content["parent"] = ["target_id" => $parent_term->id()];
  }

  yield $content;

  // Fetch children for the term.
  $children = $term_storage->loadChildren($term->id(), 'cgov_site_section');
  foreach ($children as $child) {
    foreach (get_term_objects($child, $term_storage, $term) as $yaml_content) {
      yield $yaml_content;
    }
  }
}

/**
 * Gets a multiple value list field.
 *
 * @param \Drupal\taxonomy\TermInterface $term
 *   The term.
 * @param string $field_name
 *   The name of the field.
 */
function get_multi_list_field(TermInterface $term, $field_name) {
  $field_list = $term->get($field_name);
  $values = [];

  foreach ($field_list as $field) {
    $value = $field->value;
    if ($value !== NULL) {
      $values[] = [
        "value" => $value,
      ];
    }
  }

  return count($values) > 0 ? $values : NULL;
}

/**
 * Gets a single value string field.
 *
 * @param \Drupal\taxonomy\TermInterface $term
 *   The term.
 * @param string $field_name
 *   The name of the field.
 */
function get_string_field(TermInterface $term, $field_name) {
  $value = $term->get($field_name)->value;
  if ($value !== NULL) {
    return [
      "value" => $value,
    ];
  }
}

/**
 * Gets a single value boolean field.
 *
 * @param \Drupal\taxonomy\TermInterface $term
 *   The term.
 * @param string $field_name
 *   The name of the field.
 */
function get_boolean_field(TermInterface $term, $field_name) {
  $value = $term->get($field_name)->value;
  if ($value !== NULL) {
    return [
      "value" => $value ? TRUE : FALSE,
    ];
  }
}
