<?php

namespace Drupal\cgov_core\Plugin\EntityReferenceSelection;

use Drupal\Core\Entity\Plugin\EntityReferenceSelection\DefaultSelection;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides ability to allow unpublished entities to be selected.
 *
 * Core throws in a checks to disallow unpublished entities. Normally this
 * is via a filter for the query, but when using Entity Browser that query
 * building is skipped. The validation does get fired to ensure the node
 * is not allowed. This is really just making sure that EntityReference
 * field widgets do not get a list of bad entities.
 *
 * See EntityAutocomple::validateEntityAutocomplete for an example of this
 * kind of validation.
 *
 * @EntityReferenceSelection(
 *   id = "cgov_all_selection",
 *   label = @Translation("Published and Unpublished entity selection"),
 *   entity_types = {"node", "media"},
 *   group = "cgov_all_selection",
 *   weight = 0
 * )
 */
class CgovUnpublishedSelection extends DefaultSelection {

  /**
   * {@inheritdoc}
   */
  protected function buildEntityQuery($match = NULL, $match_operator = 'CONTAINS') {
    $query = parent::buildEntityQuery($match, $match_operator);
    /* Removed is published filter that occurs in Core */
    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function createNewEntity($entity_type_id, $bundle, $label, $uid) {
    $entity = parent::createNewEntity($entity_type_id, $bundle, $label, $uid);
    /* Removed force Publish from Core */
    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function validateReferenceableNewEntities(array $entities) {
    $entities = parent::validateReferenceableNewEntities($entities);
    /* Removed Is Published filter that occurs in Core */
    return $entities;
  }

  /**
   * {@inheritdoc}
   *
   * According to the DefaultSelection code, if we remove the target_bundles
   * constraint AND nothing is checked, then NULL will be saved. So this will
   * remove our need to hand edit the configs each time. (For Nodes)
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);
    $form['target_bundles']['#required'] = FALSE;

    return $form;
  }

}
