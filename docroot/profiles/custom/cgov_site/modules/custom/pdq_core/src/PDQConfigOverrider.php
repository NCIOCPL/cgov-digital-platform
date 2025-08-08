<?php

namespace Drupal\pdq_core;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * PDQConfigOverrider - Overrides workflow config for PDQ.
 */
class PDQConfigOverrider implements ConfigFactoryOverrideInterface {

  /**
   * The service container.
   */
  private ContainerInterface $serviceContainer;

  public function __construct(ContainerInterface $serviceContainer) {
    // Creating the needed services here (the usual pattern) creates
    // a circular dependency, so we save a reference instead.
    $this->serviceContainer = $serviceContainer;
  }

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    $overrides = [];
    if (in_array('workflows.workflow.pdq_workflow', $names)) {

      $content_types = $this->serviceContainer->get('entity_type.bundle.info')->getBundleInfo('node');
      foreach ($content_types as $type => $info) {
        if (strpos($type, 'pdq_') !== FALSE) {
          $overrides['workflows.workflow.pdq_workflow']['type_settings']['entity_types']['node'][] = $type;
        }
      }

      $media_types = $this->serviceContainer->get('entity_type.bundle.info')->getBundleInfo('media');
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
