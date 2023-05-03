<?php

namespace Drupal\cgov_image;

use Drupal\content_translation\ContentTranslationHandler;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Entity\EntityInterface;

/**
 * Class for media translation handlers.
 */
class CustomMediaTranslationHandler extends ContentTranslationHandler {

  /**
   * {@inheritdoc}
   */
  public function entityFormAlter(array &$form, FormStateInterface $form_state, EntityInterface $entity) {
    if ($entity->bundle() != 'cgov_image' && $entity->bundle() != 'cgov_contextual_image') {
      return;
    }

    // Make sure site admin should be able to delete
    // Cgov_image or cgov_contextual_image media items.
    if (!in_array('site_admin', $this->currentUser->getRoles())) {
      // Restrict image manager to delete published
      // Cgov_image or cgov_contextual_image media items.
      if (in_array('image_manager', $this->currentUser->getRoles()) && $entity->isPublished()) {
        unset($form['actions']['delete']);
      }
    }
  }

}
