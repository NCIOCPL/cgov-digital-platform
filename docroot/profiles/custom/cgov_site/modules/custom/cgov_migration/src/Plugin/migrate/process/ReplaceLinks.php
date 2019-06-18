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

  private $attributeTypes = [
    'class',
    'id',
    'style',
    'target',
    'a',
    'onclick',
    'rel',
  ];

  private $knownAttributeTypes = [
    'class',
    'id',
    'style',
    'target',
    'a',
    'onclick',
    'rel',
    'href',
    'sys_dependentvariantid',
    'sys_dependentid',
    'inlinetype',
    'rxinlineslot',
    'sys_siteid',
    'sys_folderid',
    'sys_relationshipid',
    'sys_contentid',
    'sys_variantid',
  ];

  /**
   * {@inheritdoc}
   */
  public function transform($value,
  MigrateExecutableInterface $migrate_executable,
                            Row $row,
  $destination_property) {

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
    // If a dependent ID belongs to a microsite, transorms to the static URL.
    $anchors = $doc->getElementsByTagName('a');

    foreach ($anchors as $anchor) {
      $sys_dependentid = $anchor->getAttribute('sys_dependentid');
      $sys_siteid = $anchor->getAttribute('sys_siteid');
      $content = $anchor->childNodes;

      if (!empty($sys_dependentid)) {
        // Log the encoountered attributes.
        $this->logAttributes($pid, $anchor);

        // Create the replacement DOM anchor node.
        $replacementElement = $this->createLinkitEmbed($pid, $sys_dependentid,
          $sys_siteid, $content, $anchor);

        // Replace the dom node.
        $anchor->parentNode->replaceChild($replacementElement, $anchor);

        $this->migLog->logMessage($pid, 'Link created to perc ID: '
              . $sys_dependentid, E_NOTICE, 'LINK REPLACEMENT');
      }
    }
    // Returned the processed document value.
    $body = $doc->find('body');
    if ($body->count() > 0) {
      $value = $body->html();
    }
    return $value;
  }

  /**
   * Log new attributes to migration log.
   */
  public function logAttributes($pid, $anchor) {
    if ($anchor->hasAttributes()) {
      foreach ($anchor->attributes as $attr) {
        $name = $attr->nodeName;
        if (!in_array($name, $this->knownAttributeTypes)) {
          $this->migLog->logMessage($pid, "Attribute '$name' ", E_ERROR,
            'NEW ATTRIBUTES');
        }
      }
    }
  }

  /**
   * Create a linkit embed to insert into text.
   *
   * @return string
   *   Returns the linkit embed for this node.
   */
  public function createLinkitEmbed($pid, $entity_id, $sys_siteid, $content, $anchor) {

    $translationList = $this->getContentIdArray('translationid.json',
      'ID');
    $dcegList = $this->getContentIdArray('cross-site-links-dceg.json',
      'CONTENTID');

    // Grab the Entity, either a file or node.
    $entity = $this->getEntityOfUnknownType($entity_id);

    $attributes = [];

    if (!empty($entity)) {
      // The linked to item has been loaded into this instance as a node or
      // media item.
      // Set the required drupal attributes.
      $attributes = $this->generateLinkAttributes($entity);
    }
    elseif (array_key_exists($entity_id, $translationList)) {
      // The entity id doesn't live on this Drupal instance but is in the
      // reference list of items.
      // Check to see if it's been imported as a translation.
      $url = 'https://' . $translationList[$entity_id]['url'];
      // See if it has an English translation.
      $translationid = $translationList[$entity_id]['translationid'];

      // Empty arrays have non-strict comparison, check is_null also.
      if ($translationid != 'NULL' && !empty($translationid) && !is_null($translationid)) {
        // It has an english translation; verify it was loaded into the system.
        $englishEntity = $this->getEntityOfUnknownType($translationid);

        if (!empty($englishEntity)) {
          // The item was loaded into the system, generate the spanish url.
          $attributes = $this->generateLinkAttributes($englishEntity, 'espanol');
          $this->migLog->logMessage($pid, 'Replacing  spanish link which has entity ID ' .
            $entity_id .
            'to english id' . $translationid, E_NOTICE, 'REPLACE TRANSLATION');
        }

        $this->migLog->logMessage($pid, 'ERROR: ' . $entity_id .
          'THe item has a translation ID but the translation entity was not loaded ' .
          $url, E_ERROR, 'POSSIBLE FAILURE - REPLACE LINKS');
      }
      else {
        // The item was in the list but has no translation.
        // MEANING:It is either a cross-site link, a non-accounted for item,
        // or a failed Drupal Item.
        $this->migLog->logMessage($pid, 'WARNING: ' . $entity_id .
          ' is either non-loaded or missing. THe URL was: ' . $url, E_WARNING,
          'POSSIBLE FAILURE - REPLACE LINKS - SITE ID :' . $sys_siteid);

        $attributes = [
          'href' => $url,
        ];
      }
    }
    elseif (array_key_exists($entity_id, $dcegList)) {
      // The item, not loaded into this drupal instance,
      // is part of DCEG. If so create a static link.
      // Note: If the migration being run IS DCEG and the item failed or
      // is unaccounted for this may bas it. Log a warning.
      $url = 'https://' . $dcegList[$entity_id]['URL'];
      $attributes = [
        'href' => $url,
      ];
      $this->migLog->logMessage($pid, 'DCEG WARNING: ' . $entity_id .
        'Link replacement for DCEG link. THe URL was: ' . $url, E_WARNING,
        'POSSIBLE DCEG FAILURE - REPLACE LINKS - SITE ID: ' . $sys_siteid);
    }
    else {
      $this->migLog->logMessage($pid, 'ERROR: ' . $entity_id .
        ' is missing from the system and reference list. Site ID: ' .
        $sys_siteid, E_ERROR, 'FAILURE - Site ID:' . $sys_siteid);
    }

    // Create the new element.
    $element = $this->doc->createElement('a');

    // Create a document fragment to append child nodes to.
    $frag = $this->doc->createDocumentFragment();

    // For each child DOM node of the anchor, if it's a text code append the
    // text content, otherwise append the DOM node .
    foreach ($content as $node) {
      if ($node->nodeType == XML_TEXT_NODE) {
        $frag->appendChild($this->doc->createTextNode($anchor->nodeValue));
      }
      else {
        $frag->appendChild($node);
      }
    }

    // If it's not empty append the children to the new anchor element.
    if (($frag->hasChildNodes())) {
      $element->appendChild($frag);
    }
    // Set the following pre-existing attributes from the incoming link.
    foreach ($this->attributeTypes as $type) {
      $attrValue = $anchor->getAttribute($type);
      if (!empty($attrValue)) {
        $attributes[$type] = $attrValue;
      }
    }

    foreach ($attributes as $key => $value) {
      $element->setAttribute($key, $value);
    }

    return $element;
  }

  /**
   * Generate link attributes given an entity on indiscriminate type.
   */
  private function generateLinkAttributes($entity, $language = NULL) {

    if (!empty($language)) {
      $href = '/' . $language . '/' . $entity->getEntityTypeId() . '/' . $entity->id();
    }
    else {
      $href = '/' . $entity->getEntityTypeId() . '/' . $entity->id();
    }

    $attributes = [
      'data-entity-substitution' => 'canonical',
      'data-entity-type' => $entity->getEntityTypeId(),
      'href' => $href,
      'data-entity-uuid' => $entity->get('uuid')->value,
    ];

    return $attributes;
  }

}
