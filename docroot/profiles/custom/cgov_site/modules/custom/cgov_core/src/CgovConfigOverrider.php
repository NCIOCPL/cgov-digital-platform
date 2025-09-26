<?php

namespace Drupal\cgov_core;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * CgovConfigOverrider - Overrides configurations for cgov_core.
 */
class CgovConfigOverrider implements ConfigFactoryOverrideInterface {

  /**
   * The container for accessing needed services.
   */
  protected ContainerInterface $serviceContainer;

  /**
   * Closure for getting the entity type bundle info service.
   */
  protected \Closure $entityTypeBundleInfo;

  /**
   * Constructs a new CgovConfigOverrider.
   *
   * @param \Closure $entityTypeBundleInfo
   *   Closure for getting the entity type bundle info service.
   */
  public function __construct(\Closure $entityTypeBundleInfo) {
    $this->entityTypeBundleInfo = $entityTypeBundleInfo;
  }

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    $overrides = [];
    // Editorial Workflow for all node types & non-image media items.
    if (in_array('workflows.workflow.editorial_workflow', $names)) {
      $content_types = $this->getBundleInfoService()->getBundleInfo('node');
      foreach ($content_types as $type => $info) {
        if (strpos($type, 'cgov_') !== FALSE) {
          $overrides['workflows.workflow.editorial_workflow']['type_settings']['entity_types']['node'][] = $type;
        }
      }

      $media_types = $this->getBundleInfoService()->getBundleInfo('media');
      foreach ($media_types as $type => $info) {
        if (strpos($type, 'cgov_') !== FALSE && strpos($type, '_image') === FALSE) {
          $overrides['workflows.workflow.editorial_workflow']['type_settings']['entity_types']['media'][] = $type;
        }
      }
    }

    // Simple Workflow is only for Custom Block Types and Images.
    if (in_array('workflows.workflow.simple_workflow', $names)) {
      $custom_block_types = $this->getBundleInfoService()->getBundleInfo('block_content');
      foreach ($custom_block_types as $type => $info) {
        // Do not check for a prefix for block content as all block_content
        // should follow the simple workflow.
        $overrides['workflows.workflow.simple_workflow']['type_settings']['entity_types']['block_content'][] = $type;
      }

      $media_types = $this->getBundleInfoService()->getBundleInfo('media');
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

  /**
   * Wrapper for retrieving the entity type bundle info service.
   *
   * This isn't strictly necessary, but it gets us a bit more declared type
   * information versus using the closure directly.
   *
   * @return \Drupal\Core\Entity\EntityTypeBundleInfoInterface
   *   The entity type bundle info service.
   */
  protected function getBundleInfoService() : EntityTypeBundleInfoInterface {
    return ($this->entityTypeBundleInfo)();
  }

}
