<?php

namespace Drupal\cgov_yaml_content\Service;

use Drupal\yaml_content\Event\YamlContentEvents;
use Drupal\yaml_content\Event\EntityPostSaveEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\block\Entity\Block;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\Core\Theme\ThemeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Component\Render\PlainTextOutput;
use Drupal\Core\Utility\Token;
use Drupal\Core\TypedData\Exception\MissingDataException;
use Drupal\file\Plugin\Field\FieldType\FileFieldItemList;
use Drupal\Core\Entity\EntityInterface;

/**
 * Handle yaml_content custom events.
 */
class CgovYamlContentEventSubscriber implements EventSubscriberInterface {

  /**
   * Drupal Core Theme Manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * Drupal Entity Query Factory.
   *
   * @var \Drupal\Core\Entity\Query\QueryFactory
   */
  protected $entityQueryFactory;

  /**
   * Drupal Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Drupal token service.
   *
   * @var \Drupal\Core\Utility\Token
   */
  protected $token;

  /**
   * Create new Event Subscriber class.
   *
   * @param \Drupal\Core\Theme\ThemeManagerInterface $themeManager
   *   Theme Manager.
   * @param \Drupal\Core\Entity\Query\QueryFactory $entityQueryFactory
   *   Query factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Drupal Entity Type Manager.
   * @param \Drupal\Core\Utility\Token $token
   *   Drupal token service.
   */
  public function __construct(
    ThemeManagerInterface $themeManager,
    QueryFactory $entityQueryFactory,
    EntityTypeManagerInterface $entityTypeManager,
    Token $token
    ) {
    $this->themeManager = $themeManager;
    $this->entityQueryFactory = $entityQueryFactory;
    $this->entityTypeManager = $entityTypeManager;
    $this->token = $token;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events = [];
    $events[YamlContentEvents::ENTITY_POST_SAVE][] = ['addSpanishTranslations'];
    $events[YamlContentEvents::ENTITY_POST_SAVE][] = ['addToRegion'];
    $events[YamlContentEvents::ENTITY_POST_SAVE][] = ['handlePostSaveEvents'];

    return $events;
  }

  /**
   * Generate random alphanumeric string.
   *
   * @param int $length
   *   A number.
   */
  public static function generateRandomString(int $length) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
      $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
  }

  /**
   * Create a new Spanish paragraph.
   *
   * @param array $fieldData
   *   Field data as array.
   */
  public function createParagraph(array $fieldData) {
    $paragraph = Paragraph::create($fieldData);
    $paragraph->langcode = 'es';
    $paragraph->save();
    $paragraphEntityReferenceFields = [
      'target_id' => $paragraph->id(),
      'target_revision_id' => $paragraph->getRevisionId(),
    ];
    return $paragraphEntityReferenceFields;
  }

  /**
   * Translate paragraphs (recursive).
   *
   * Walk the field arrays. If paragraphs are
   * found, create a nnew entity and replace the
   * field with the paragraph reference fields.
   * This must be done deepest nested first so
   * parent paragraphs will have children
   * paragraph references at the time of their
   * creation.
   *
   * @param array|string $fields
   *   Entity/Field data as array.
   *
   * @return array
   *   Processed fields.
   */
  public function translateParagraphs($fields) {
    if (!is_array($fields)) {
      return $fields;
    }

    foreach ($fields as $key => $value) {
      $fields[$key] = $this->translateParagraphs($value);
    }

    $isParagraph = $fields['entity'] === 'paragraph';
    if ($isParagraph) {
      $fields = $this->createParagraph($fields);
    }

    return $fields;
  }

  /**
   * Retrieve entity reference by params.
   *
   * Important to note is this doesn't currently
   * support updating the references (such as adding
   * an 'alt' tag to images.)
   *
   * @param array $value
   *   Process directive array in this format:
   *   ```yaml
   *   '#process':
   *     callback: '<callback string>'
   *     args:
   *       - <callback argument 1>
   *       - <callback argument 2>
   *       - <...>
   *    ```.
   *
   * @return array
   *   Entity reference.
   */
  public function processReference(array $value) {
    $fieldReferenceArray = [];
    $entity_type = $value['#process']['args'][0];
    $args = $value['#process']['args'][1];
    $query = $this->entityQueryFactory->get($entity_type);
    foreach ($args as $property => $value) {
      $query->condition($property, $value);
    }
    $entity_ids = $query->execute();

    // Reference entity can't be found. Create it.
    if (empty($entity_ids)) {
      $entity = $this->entityTypeManager->getStorage($entity_type)->create($args);
      $entity_ids = [$entity->id()];
    }

    // Creating it failed.
    if (empty($entity_ids)) {
      return $this->throwParamError('Unable to process reference. Reference not found.', $entity_type);
    }

    $first_id = array_shift($entity_ids);
    $fieldReferenceArray = ['target_id' => $first_id];
    return $fieldReferenceArray;
  }

  /**
   * Handle #process file directives.
   *
   * @param array $processConfig
   *   Config.
   * @param \Drupal\file\Plugin\Field\FieldType\FileFieldItemList $field
   *   Field.
   */
  public function processFile(array $processConfig, FileFieldItemList $field) {
    var_dump(get_class($field));
    $entity_type = $processConfig['#process']['args'][0];
    $filename = $processConfig['#process']['args'][1]['filename'];
    unset($processConfig['#process']);
    // After unsetting the #process config, we should be
    // left with anything intended for the field, such as alt
    // tags.
    $path = drupal_get_path('module', 'cgov_yaml_content');
    $directory = '/data_files/';
    // If the entity type is an image, look in to the /images directory.
    if ($entity_type == 'image') {
      $directory = '/images/';
    }
    $fileData = file_get_contents($path . $directory . $filename);
    $fileExists = $fileData !== FALSE;
    if ($fileExists) {
      $destination = 'public://';
      // Look-up the field's directory configuration.
      // Returns a token pattern.
      $directory = $field->getSetting('file_directory');
      if ($directory) {
        $directory = trim($directory, '/');
        $directory = PlainTextOutput::renderFromHtml($this->token->replace($directory));
        if ($directory) {
          $destination .= $directory . '/';
        }
      }

      // Create the destination directory if it does not already exist.
      file_prepare_directory($destination, FILE_CREATE_DIRECTORY);

      // Save the file data or return an existing file.
      $file = file_save_data($fileData, $destination . $filename, FILE_EXISTS_REPLACE);

      // Use the newly created file id as the value.
      $processConfig['target_id'] = $file->id();
      return $processConfig;
    }
    else {
      return $this->throwParamError('Unable to process file content. File not found.', $entity_type);
    }

  }

  /**
   * Test for and handle #process directives.
   *
   * @param array|string $fields
   *   Entity/Field data as array.
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   Entity.
   *
   * @return array
   *   Processed fields.
   */
  public function handleProcessDirectives($fields, EntityInterface $entity) {
    foreach ($fields as $fieldName => $fieldData) {
      // Test for process directives:
      // Process directives are associative arrays with
      // a '#process', 'callback', and 'args' key.
      // Frustratingly, there are multiple ways of formatting #process
      // directives in yaml_content (we are going to ignore the target_type
      // key since it seems redundant (until inevitably proven otherwise.))
      // Fields can contain multiple directives. So we are only looking
      // for arrays.
      $fieldContainsArray = is_array($fieldData);
      if ($fieldContainsArray) {
        // We will have to determine later on if passing an array of elements is
        // is appropriate or not. For now we will assume so and gather them here
        // before adding them to the field.
        $processedFieldContents = [];
        foreach ($fieldData as $value) {
          $isProcessDirective = is_array($value) && isset($value['#process']);
          if ($isProcessDirective) {
            // For 'reference' #process directives.
            if (isset($value['#process']['callback']) && $value['#process']['callback'] === 'reference') {
              $processedReference = $this->processReference($value);
              $processedFieldContents[] = $processedReference;
            }
            elseif ((isset($value['#process']['callback']) && $value['#process']['callback'] === 'file')) {
              $field = $entity->get($fieldName);
              $processedReference = $this->processFile($value, $field);
              $processedFieldContents[] = $processedReference;
            }
            else {
              // You made a mistake formatting your process directive. Ha ha.
              // Go directly to jail, do not pass go.
              return $this->throwParamError('Unable to process file content. Process callback not file or reference.', "", $value);
            }
          }
          else {
            // NOTE: Because of the simple multipass processing we're doing, a
            // field that mixed paragraphs and process directives is currently
            // unsupported. However, we will try and preserve non directive
            // elements and see what happens... (In theory, paragraphs would've
            // already been created and the references inserted here).
            $processedFieldContents[] = $value;
          }
        }
        // NOTE: This implementation does not test field cardinality. This
        // means that if an array is provided when only a single element should
        // be, it will probably be very unhappy.
        $fields[$fieldName] = $processedFieldContents;
      }
    }
    return $fields;
  }

  /**
   * Add available Spanish translations.
   *
   * @param \Drupal\yaml_content\Event\EntityPostSaveEvent $event
   *   The event fired before entity field data is imported and assigned.
   */
  public function addSpanishTranslations(EntityPostSaveEvent $event) {
    $yamlContent = $event->getContentData();
    $entity = $event->getEntity();

    // The following may seem a bit redundant, but it was realized that
    // pathauto hooks and yaml_content hooks were passing/receiving
    // stale copies of the entities they were modifying. This allows us
    // to update our copy of the entity from the yaml_content event
    // and corrects an issue where pathauto was not generating url aliases
    // on spanish translations on the first pass of the ycim command.
    $entityId = $entity->id();
    $entityType = $entity->getEntityTypeId();
    $entity = $this->entityTypeManager->getStorage($entityType)->load($entityId);

    $translatedFields = [];
    // 1. Gather Spanish field translations.
    // The yaml files contain fields (marked XXX__ES) that are
    // not valid for the given entity type and therefore not saved in
    // the initially created entity. Here we grab them, work backwards
    // to determine the English field they apply to and then manually
    // construct an array of translated fields to be used inn the creation
    // of a new translation entity.
    foreach ($yamlContent as $fieldName => $fieldValues) {
      // Non-valid, translation storage fields match this pattern.
      $testForSpanishTranslation = "/.+__ES$/";
      $isSpanishTranslationField = preg_match($testForSpanishTranslation, $fieldName);
      if ($isSpanishTranslationField) {
        $originalEnglishFieldName = substr($fieldName, 0, -4);
        $spanishContent = $fieldValues;
        if ($spanishContent !== NULL) {
          $translatedFields[$originalEnglishFieldName] = $spanishContent;
        }
      }
    }

    // Guard clause: Don't translate fields that don't have an
    // english counterpart.
    foreach ($translatedFields as $fieldName => $fieldValue) {
      $fieldExistsOnEnglishEntity = $entity->hasField($fieldName);
      if (!$fieldExistsOnEnglishEntity) {
        unset($translatedFields[$fieldName]);
      }
    }

    // Guard clause: Don't add an entity translation when no fields
    // have translations.
    $noFieldsToTranslate = count($translatedFields) === 0;
    if ($noFieldsToTranslate) {
      return;
    }

    // 2. Check for paragraphs.
    // Paragraphs have to be treated differently from other
    // entity types. Instead of adding a translation to the
    // paragraph entity, we create a translated duplicate and
    // replace the original English paragraph with a reference to
    // it. Magic associates the two distinct paragraphs by being
    // contained in the same field on the same entity.
    // Multiple paragraphs can be in the same field.
    // NB: Translations are not required to have the same
    // number of paragraph entities for a given field
    // as the original entity.
    $translatedFields = $this->translateParagraphs($translatedFields);

    // 3. Translate "#process" fields.
    // The yaml_content loader offers the ability to use process functions
    // as callbacks in the yml.
    // Translated fields also doing that don't have access to this feature
    // so we are going to recreate the functionality on an as-needed basis.
    $translatedFields = $this->handleProcessDirectives($translatedFields, $entity);

    // 4. Create translation.
    $spanishTranslationAlreadyExists = $entity->hasTranslation('es');
    if (!$spanishTranslationAlreadyExists) {
      $entityArray = $entity->toArray();
      $translation = array_merge($entityArray, $translatedFields);
      $entity->addTranslation('es', $translation);
    }

    $spanishTranslation = $entity->getTranslation('es');
    foreach ($translatedFields as $fieldName => $fieldValue) {
      $spanishTranslation->{$fieldName} = $fieldValue;
    }
    $spanishTranslation->{'moderation_state'} = $entity->{'moderation_state'};
    // We need to discreetly save the translation to trigger pathauto
    // url alias building.
    $spanishTranslation->save();
    // In the event that this translation should be a landing page we want
    // to set that up now.
    $this->addLandingPage($spanishTranslation);
    $entity->save();
  }

  /**
   * Add a raw_html_block to a default region.
   *
   * Default block_content content blocks need to be attached to
   * blocks in order to be placed in regions on a given theme.
   * In addition, block_content content.yml files need to specify
   * a region__CONFIG containing a value field that matches a
   * valid region in the active theme in order to be created and placed.
   *
   * @param \Drupal\yaml_content\Event\EntityPostSaveEvent $event
   *   The triggered event when an entity has been saved.
   */
  public function addToRegion(EntityPostSaveEvent $event) {
    $savedEntity = $event->getEntity();

    // We don't need this to run on default node entities.
    $entityType = $savedEntity->bundle();
    $isRawHTMLBlock = $entityType === 'raw_html_block';
    if (!$isRawHTMLBlock) {
      return;
    }

    // If no default region is set on the custom block, there's
    // nothing to do here.
    // However, the region setting is not on the entity but on the
    // processed yaml content array. We need to pull it from here. (If
    // it exists).
    $yamlContent = $event->getContentData();
    $savedEntityRegion = isset($yamlContent['region__CONFIG']) ? $yamlContent['region__CONFIG']['value'] : NULL;
    if (!$savedEntityRegion) {
      return;
    }

    $theme = $this->themeManager->getActiveTheme();
    // We only want to create a block when a valid default region
    // is specified.
    $regions = $theme->getRegions();
    $isValidRegion = in_array($savedEntityRegion, $regions);
    if (!$isValidRegion) {
      return;
    }

    // We need to create a block to attach the block_content to
    // to place in a given theme region.
    $blockSettings = [
      'id' => self::generateRandomString(10),
      'plugin' => 'block_content:' . $savedEntity->uuid(),
      'provider' => 'block_content',
      'region' => $savedEntityRegion,
      'theme' => $theme->getName(),
      'weight' => 0,
      'status' => TRUE,
      'settings' => [
        'id' => 'block_content:' . $savedEntity->uuid(),
        'label_display' => '0',
        'provider' => 'block_content',
      ],
      'visibility' => [],
    ];
    $block = Block::create($blockSettings);
    $block->save();
    printf("Added default block to $savedEntityRegion region.\n");
  }

  /**
   * Call local functions to handle events.
   *
   * @param \Drupal\yaml_content\Event\EntityPostSaveEvent $event
   *   The triggered event when an entity has been saved.
   */
  public function handlePostSaveEvents(EntityPostSaveEvent $event) {
    $savedEntity = $event->getEntity();
    $this->addLandingPage($savedEntity);
  }

  /**
   * Add Landing Pages to Site Sections.
   *
   * Programmatically add entity reference in Terms for
   * landing pages.
   */
  public function addLandingPage($savedEntity) {
    $entityType = $savedEntity->getEntityTypeId();
    // $bundleType = $savedEntity->bundle();
    // TODO: For now we want to do the same thing for all content
    // types. In the future, special rules will have to be added
    // to accomodate CTHP bundles.
    $isNode = $entityType === 'node';
    if (!$isNode) {
      return;
    }
    $hasPrettyUrl = $savedEntity->hasField('field_pretty_url');
    $hasSiteSection = $savedEntity->hasField('field_site_section');
    if (!$hasPrettyUrl || !$hasSiteSection) {
      return;
    }
    $prettyUrlValue = $savedEntity->get('field_pretty_url')->value;
    // Anything that has a pretty url is not a landing page.
    if ($prettyUrlValue) {
      return;
    }
    $siteSectionEntityReferenceFieldItemListField = $savedEntity->get('field_site_section');
    $siteSectionEntityList = $siteSectionEntityReferenceFieldItemListField->referencedEntities();
    $hasSiteSectionEntityReference = count($siteSectionEntityList) > 0;
    // Somebody was a bad boy and forgot to add the correct site section
    // reference in this field in their .content.yml file.
    if (!$hasSiteSectionEntityReference) {
      return;
    }
    $siteSection = $siteSectionEntityList[0];
    $savedEntityReference = [
      'target_id' => $savedEntity->id(),
    ];
    $siteSection->set('field_landing_page', $savedEntityReference);
    $siteSection->save();
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
      '  "entity_type" => ' . $entity_type . ',',
    ];
    foreach ($filter_params as $key => $value) {
      $error_params[] = sprintf("  '%s' => '%s',", $key, $value);
    }
    $error_params[] = ']';
    $param_output = implode("\n", $error_params);

    throw new MissingDataException(__CLASS__ . ': ' . $error_message . ': ' . $param_output);
  }

}
