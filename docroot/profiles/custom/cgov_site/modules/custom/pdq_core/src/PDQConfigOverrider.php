<?php

namespace Drupal\pdq_core;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;

/**
 * PDQConfigOverrider - Overrides workflow config for PDQ.
 */
class PDQConfigOverrider implements ConfigFactoryOverrideInterface {

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    $overrides = [];
    if (in_array('workflows.workflow.pdq_workflow', $names)) {
      // phpcs:disable
      $content_types = \Drupal::service('entity_type.bundle.info')->getBundleInfo('node');
      // phpcs:enable
      foreach ($content_types as $type => $info) {
        if (strpos($type, 'pdq_') !== FALSE) {
          $overrides['workflows.workflow.pdq_workflow']['type_settings']['entity_types']['node'][] = $type;
        }
      }
      // phpcs:disable
      $media_types = \Drupal::service('entity_type.bundle.info')->getBundleInfo('media');
      // phpcs:enable
      foreach ($media_types as $type => $info) {
        if (strpos($type, 'pdq_') !== FALSE) {
          $overrides['workflows.workflow.pdq_workflow']['type_settings']['entity_types']['media'][] = $type;
        }
      }
    }
    return $overrides;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheSuffix() {
    return 'PDQConfigOverrider';
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata($name) {
    return new CacheableMetadata();
  }

  /**
   * {@inheritdoc}
   */
  public function createConfigObject($name, $collection = StorageInterface::DEFAULT_COLLECTION) {
    return NULL;
  }

}
