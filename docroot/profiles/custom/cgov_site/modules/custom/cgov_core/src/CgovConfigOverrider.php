<?php

namespace Drupal\cgov_core;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;

/**
 * CgovConfigOverrider - Overrides configurations for cgov_core.
 */
class CgovConfigOverrider implements ConfigFactoryOverrideInterface {

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    $overrides = [];
    // Editorial Workflow for all node types & non-image media items.
    if (in_array('workflows.workflow.editorial_workflow', $names)) {
      // phpcs:disable
      $content_types = \Drupal::service('entity_type.bundle.info')->getBundleInfo('node');
      // phpcs:enable
      foreach ($content_types as $type => $info) {
        if (strpos($type, 'cgov_') !== FALSE) {
          $overrides['workflows.workflow.editorial_workflow']['type_settings']['entity_types']['node'][] = $type;
        }
      }

      // phpcs:disable
      $media_types = \Drupal::service('entity_type.bundle.info')->getBundleInfo('media');
      // phpcs:enable
      foreach ($media_types as $type => $info) {
        if (strpos($type, 'cgov_') !== FALSE && strpos($type, '_image') === FALSE) {
          $overrides['workflows.workflow.editorial_workflow']['type_settings']['entity_types']['media'][] = $type;
        }
      }
    }
    // Simple Workflow is only for Custom Block Types and Images.
    if (in_array('workflows.workflow.simple_workflow', $names)) {
      // phpcs:disable
      $custom_block_types = \Drupal::service('entity_type.bundle.info')->getBundleInfo('block_content');
      // phpcs:enable
      foreach ($custom_block_types as $type => $info) {
        // Do not check for a prefix for block content as all block_content
        // should follow the simple workflow.
        $overrides['workflows.workflow.simple_workflow']['type_settings']['entity_types']['block_content'][] = $type;
      }

      // phpcs:disable
      $media_types = \Drupal::service('entity_type.bundle.info')->getBundleInfo('media');
      // phpcs:enable
      foreach ($media_types as $type => $info) {
        // Only check for image media items.
        if (strpos($type, 'cgov_') !== FALSE && strpos($type, '_image') !== FALSE) {
          $overrides['workflows.workflow.simple_workflow']['type_settings']['entity_types']['media'][] = $type;
        }
      }
    }
    return $overrides;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheSuffix() {
    return 'CgovConfigOverrider';
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
