<?php

namespace Drupal\app_module\Controller;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Entity\EntityInterface;

/**
 * Provides a listing of Application Modules.
 */
class AppModuleListBuilder extends ConfigEntityListBuilder {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'app_module';
  }

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['label'] = $this->t('Application Module');
    $header['id'] = $this->t('Machine name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    $row['label'] = $entity->label();
    $row['id'] = $entity->id();

    return $row + parent::buildRow($entity);
  }

}
