<?php

namespace Drupal\cgov_yaml_content\Service;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\TypedData\Exception\MissingDataException;
use DOMWrap\Document;

/**
 * Helper service for YAML content loading for <drupal-entity> tags.
 *
 * This service will replace <drupal-entity> UUID attributes with the UUIDs of
 * content that had been previously loaded in our content loading.
 *
 * NOTE: For sanity, this only supports ContentEntities as they can have fields.
 */
class YamlEntityEmbedProcessor {

  /**
   * Drupal Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Create new Event Subscriber class.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Drupal Entity Type Manager.
   */
  public function __construct(
    EntityTypeManagerInterface $entityTypeManager
  ) {
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * This is the main entry point that will process an entity.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity to be processed.
   */
  public function processEntity(ContentEntityInterface $entity) {

    // We only need to check text_long fields as those are the ones that can
    // hold HTML, and thus only the ones to contain <drupal-entity> tags.
    foreach ($entity->getFields() as $field) {
      if ($field->getFieldDefinition()->getType() === 'text_long') {
        $this->handleEmbedForTextLong($field);
      }
    }
  }

  /**
   * Function for processing <drupal-embed> tags in a text_long field.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface $field
   *   The Field to process.
   */
  public function handleEmbedForTextLong(FieldItemListInterface $field) {
    // Loop over values and replace.
    foreach ($field as $field_item) {
      /* $field_item is of type TextLongItem. */
      if (preg_match("/<drupal-entity/", $field_item->value)) {
        $field_item->value = $this->transformEmbeds($field_item->value);
      }
    }
  }

  /**
   * Finds all the drupal-enitity elements and looks up their UUID.
   *
   * @param string $value
   *   The string to transform.
   */
  public function transformEmbeds($value) {
    $doc = new Document();
    $doc->html($value);
    $allEmbeds = $doc->getElementsByTagName('drupal-entity');

    // Note: Don't use a foreach; it doesn't work. Must loop backwards.
    // Stolen from The Developer Formerly Know As Adrian's Migrate code.
    // Ask ‽ why it does not work. :)
    $length = $allEmbeds->length;
    for ($i = $length - 1; $i >= 0; $i--) {
      $drupalEntityEl = $allEmbeds->item($i);

      // Only process if the UUID is process. We may find already processed
      // fields in translations or some other nonsense...
      if ($drupalEntityEl->getAttr('data-entity-uuid') === "#process") {
        $entityType = $drupalEntityEl->getAttr('data-entity-type');
        if (!$entityType) {
          $this->throwParamError("Invalid entity embed, missing #process");
        }
        $queryParams = $this->mapYamlQueryAttrToParams($drupalEntityEl->attributes);

        $uuid = $this->queryEntityUuid($entityType, $queryParams);
        if ($uuid) {
          $drupalEntityEl->setAttr('data-entity-uuid', $uuid);
        }
        else {
          $this->throwParamError("Could not find entity for embed", $entityType, $queryParams);
        }
      }
    }

    // Return the value.
    $body = $doc->find('body');
    if ($body->count() > 0) {
      $value = $body->html();
    }

    return $value;
  }

  /**
   * Finds a UUID for embedding.
   *
   * YAML Content module does not handle media in its helper, so
   * we will need to roll our own.
   *
   * @param string $entity_type
   *   The type of entity being imported.
   * @param array $content_data
   *   The import content structure representing the entity being searched for.
   *
   * @return string|false
   *   Return a matching UUID if one is found, or FALSE otherwise.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   */
  public function queryEntityUuid($entity_type, array $content_data) {
    $storage = $this->entityTypeManager->getStorage($entity_type);
    $query = $storage->getQuery('AND');
    foreach ($content_data as $key => $value) {
      if ($key != 'entity' && !is_array($value)) {
        $query->condition($key, $value);
      }
    }
    $entity_ids = $query->execute();

    // Nothing was found.
    if (empty($entity_ids)) {
      return FALSE;
    }

    // If there were more than one then we should throw an error.
    if (count($entity_ids) != 1) {
      return $this->throwParamError('Multiple embed entities matched query.', $entity_type, $content_data);
    }

    $entities = $storage->loadMultiple($entity_ids);

    if (count($entity_ids) != 1) {
      return $this->throwParamError('Multiple embed entities matched query.', $entity_type, $content_data);
    }

    return array_shift($entities)->uuid();
  }

  /**
   * Converts a collection of attributes to entity query params.
   *
   * @param \DOMNamedNodeMap $attrs
   *   Attributes List.
   *
   * @return array
   *   An array of the entity query parameters.
   */
  public function mapYamlQueryAttrToParams(\DOMNamedNodeMap $attrs) {
    $params = [];
    foreach ($attrs as $name => $attrNode) {
      $matches = [];
      if (preg_match("/^data-cgov-yaml-query-(.*)$/", $name, $matches)) {
        $params[$matches[1]] = $attrNode->value;
      }
    }
    return $params;
  }

  /**
   * Prepare an error message and throw error.
   *
   * @param string $error_message
   *   The error message to display.
   * @param string $entity_type
   *   The entity type.
   * @param array $filter_params
   *   The filters for the query conditions.
   */
  protected function throwParamError($error_message, $entity_type = "ENTITY TYPE UNKNOWN", array $filter_params = []) {
    // Build parameter output description for error message.
    $error_params = [
      '[',
      '  "entity_type" => "' . $entity_type . '",',
    ];
    foreach ($filter_params as $key => $value) {
      $error_params[] = sprintf("  '%s' => '%s',", $key, $value);
    }
    $error_params[] = ']';
    $param_output = implode("\n", $error_params);

    throw new MissingDataException(__CLASS__ . ': ' . $error_message . ': ' . $param_output);
  }

}
