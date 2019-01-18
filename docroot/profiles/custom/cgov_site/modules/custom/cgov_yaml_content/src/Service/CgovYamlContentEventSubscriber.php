<?php

namespace Drupal\cgov_yaml_content\Service;

use Drupal\yaml_content\Event\YamlContentEvents;
use Drupal\yaml_content\ContentLoader\ContentLoaderInterface;
use Drupal\yaml_content\Event\EntityPostSaveEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\block\Entity\Block;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\Core\Theme\ThemeManagerInterface;

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
   * Yaml Content Content Loader.
   *
   * @var \Drupal\yaml_content\ContentLoader\ContentLoaderInterface
   */
  protected $contentLoader;

  /**
   * Create new Event Subscriber class.
   *
   * @param \Drupal\Core\Theme\ThemeManagerInterface $themeManager
   *   Theme Manager.
   * @param \Drupal\yaml_content\ContentLoader\ContentLoaderInterface $contentLoader
   *   Content Loader.
   */
  public function __construct(ThemeManagerInterface $themeManager, ContentLoaderInterface $contentLoader) {
    $this->themeManager = $themeManager;
    $this->contentLoader = $contentLoader;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events = [];
    $events[YamlContentEvents::ENTITY_POST_SAVE][] = ['addSpanishTranslations'];
    $events[YamlContentEvents::ENTITY_POST_SAVE][] = ['addToRegion'];

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
   * Add available Spanish translations.
   *
   * @param \Drupal\yaml_content\Event\EntityPostSaveEvent $event
   *   The event fired before entity field data is imported and assigned.
   */
  public function addSpanishTranslations(EntityPostSaveEvent $event) {
    $yamlContent = $event->getContentData();
    $entity = $event->getEntity();
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
    foreach ($translatedFields as $fieldName => $fieldData) {
      if (is_array($fieldData) && count($fieldData) > 0) {
        // Multiple paragraphs can be in the same field.
        // NB: Translations are not required to have the same
        // number of paragraph entities for a given field
        // as the original entity.
        $translatedParagraphs = [];
        foreach ($fieldData as $dataArray) {
          if (is_array($dataArray)) {
            $fieldEntityType = $dataArray['entity'];
            if ($fieldEntityType === 'paragraph') {
              $paragraph = Paragraph::create($dataArray);
              $paragraph->langcode = 'es';
              $paragraph->save();
              $translatedParagraphs[] = [
                'target_id' => $paragraph->id(),
                'target_revision_id' => $paragraph->getRevisionId(),
              ];
            };
          }
        }
        if (count($translatedParagraphs) > 0) {
          $translatedFields[$fieldName] = $translatedParagraphs;
        }
      }
    }

    // 3. Translate "#process" fields.
    // The yaml_content loader offers the ability to use process functions
    // as callbacks in the yml.
    // Translated fields also doing that don't have access to this feature
    // so we are going to borrow the functionality. Unfortunately, the
    // preprocess method is protected, so we need to use another public
    // method to access it.
    // The yaml_content ContentLoader buildEntity method expects the parsed
    // yaml to work with, so we want to make sure the version with the spanish
    // fields replacing the english ones is provided.
    // Ultimately we are provided a second entity that has the process fields
    // in a post processed state, from which we can grab the values to add to
    // our translation. This returned entity is not saved, here or in
    // yaml_content.
    // Also, it's important to note that behind the scenes, this will also allow
    // yaml_content to correctly move the processed files into the
    // sites/default/files  directory for later access.
    $translatedYaml = array_merge($yamlContent, $translatedFields);
    $processedTranslatedEntity = $this->contentLoader->buildEntity($translatedYaml['entity'], $translatedYaml);

    // 4. Create translation.
    $spanishTranslationAlreadyExists = $entity->hasTranslation('es');
    if (!$spanishTranslationAlreadyExists) {
      $entityArray = $entity->toArray();
      $translation = array_merge($entityArray, $translatedFields);
      $entity->addTranslation('es', $translation);
    }
    $spanishTranslation = $entity->getTranslation('es');
    foreach ($translatedFields as $fieldName => $fieldValue) {
      $spanishTranslation->{$fieldName} = $processedTranslatedEntity->{$fieldName};
    }
    $spanishTranslation->{'moderation_state'} = $entity->{'moderation_state'};
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

}
