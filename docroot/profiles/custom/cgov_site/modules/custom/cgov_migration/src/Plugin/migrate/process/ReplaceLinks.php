<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Replace percussion links tags with drupal node links.
 *
 * @MigrateProcessPlugin(
 *   id = "replace_links"
 * )
 */
class ReplaceLinks extends CgovPluginBase {

  protected $migLog;
  protected $doc;

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    // Exit early if the field not set.
    if (!isset($value)) {
      return NULL;
    }

    // Setup the document.
    $doc = $this->doc;
    $pid = $this->getPercID($row);
    $doc->html($value);

    // Loop through the anchor elements and search for ones with dependent ID's.
    // Replace those anchors with the equivalent drupal '/node/id' URL.
    $anchors = $doc->getElementsByTagName('a');
    foreach ($anchors as $anchor) {

      $sys_dependentid = $anchor->getAttribute('sys_dependentid');
      $classes = $anchor->getAttribute('class');
      $content = $anchor->nodeValue;
      if (!empty($sys_dependentid)) {
        $replacementElement = $this->createLinkitEmbed($sys_dependentid, $content, $classes);

        $anchor->parentNode->replaceChild($replacementElement, $anchor);
        $this->migLog->logMessage($pid, 'Link created to perc ID: '
              . $sys_dependentid, E_NOTICE, 'LINK REPLACEMENT');
      }
    }
    // Returned the processed document value.
    $body = $doc->find('body');
    $size = $body->count();
    if ($size > 0) {
      $value = $body->html();
    }

    return $value;
  }

  /**
   * Create linkit embed to insert into text.
   *
   * @return string
   *   Returns the linkit embed for this node.
   */
  public function createLinkitEmbed($entity_id, $content, $classes) {
    $entity_type = 'node';
    $entity_storage = \Drupal::entityTypeManager()->getStorage('node');
    $entity = $entity_storage->load($entity_id);

    $element = $this->doc->createElement('a');
    $element->appendChild($this->doc->createTextNode($content));

    if (!empty($entity)) {
      $attributes = [
        'data-entity-substitution' => 'canonical',
        'data-entity-type' => $entity_type,
        'href' => '/node/' . $entity_id,
        'data-entity-uuid' => $entity->get('uuid')->value,
      ];

      if (!empty($classes)) {
        $attributes['class'] = $classes;
      }

      foreach ($attributes as $key => $value) {
        $element->setAttribute($key, $value);

      }
    }
    return $element;
  }

}
