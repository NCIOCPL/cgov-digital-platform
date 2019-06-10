<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Replace percussion inline variants with Drupal embeds..
 *
 * @MigrateProcessPlugin(
 *   id = "replace_embeds"
 * )
 */
class ReplaceEmbeds extends CgovPluginBase {

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

    $doc = $this->doc;
    $pid = $this->getPercID($row);

    $doc->html($value);
    $allDivs = $doc->getElementsByTagName('placeholder');
    for ($i = $allDivs->length - 1; $i >= 0; $i--) {
      $divNode = $allDivs->item($i);
      $sys_dependentvariantid = $divNode->getAttr('sys_dependentvariantid');

      // The embedded items ID.
      $sys_dependentid = $divNode->getAttr('sys_dependentid');

      if (!empty($sys_dependentvariantid)) {
        // Populate the attributes for the Drupal embed.
        $embedAttributes = $this->getEmbedAttributes($sys_dependentvariantid);

        if (!empty($embedAttributes)) {
          $replacementEmbed = $this->createEmbedText($sys_dependentid, $embedAttributes);
          $divNode->parentNode->replaceChild($replacementEmbed, $divNode);
          $this->migLog->logMessage($pid, 'Embed replaced for perc ID: ' . $sys_dependentid, E_NOTICE, $sys_dependentvariantid);
        }
        else {
          // Put a error placeholder.
          $this->migLog->logMessage($pid, 'No embed mapping found for:' . $sys_dependentvariantid . ' on PID ' . $pid, E_ERROR, $sys_dependentvariantid);
          $replacementEmbed = $this->doc->createElement('drupal-entity', 'ERROR REPLACING ENTITY: ' . $sys_dependentid . ' With variant: ' . $sys_dependentvariantid);
          $divNode->parentNode->replaceChild($replacementEmbed, $divNode);

        }
      }
    }

    $body = $doc->find('body');
    $size = $body->count();
    if ($size > 0) {
      $value = $body->html();
    }

    return $value;
  }

  /**
   * Create a embed item to insert into text.
   *
   * @return string
   *   Returns the embed item for this entity.
   */
  public function createEmbedText($entity_id, $values) {

    $entity_storage = \Drupal::entityTypeManager()->getStorage($values['data_entity_type']);
    $entity = $entity_storage->load($entity_id);

    $element = $this->doc->createElement('drupal-entity');
    if (!empty($entity)) {
      $view_mode = !empty($values['view_mode']) ? $values['view_mode'] : NULL;
      $data_align = !empty($values['data_align']) ? $values['data_align'] : NULL;
      $data_caption = !empty($values['data_caption']) ? $values['data_caption'] : NULL;
      $data_embed_button = !empty($values['data_embed_button']) ? $values['data_embed_button'] : NULL;
      $data_entity_type = !empty($values['data_entity_type']) ? $values['data_entity_type'] : NULL;
      $attributes = [
        'data-embed-button' => $data_embed_button,
        'data-entity-embed-display' => $view_mode,
        'data-entity-type' => $data_entity_type,
        'data-entity-uuid' => $entity->get('uuid')->value,
      ];
      if (!empty($data_align)) {
        $attributes['data-align'] = $data_align;
      }
      $attributes['data-caption'] = $data_caption;

      foreach ($attributes as $key => $value) {
        $element->setAttribute($key, $value);
      }
    }
    else {
      $element = $this->doc->createElement('drupal-entity', 'WARNING: UNABLE TO AUTOMATICALLY REPLACE ENTITY: ' . $entity_id);
    }
    return $element;
  }

}
