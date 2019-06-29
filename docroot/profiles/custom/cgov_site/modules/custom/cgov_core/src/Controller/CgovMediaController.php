<?php

namespace Drupal\cgov_core\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\media\Entity\Media;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Controller routines for cgov_core routes.
 */
class CgovMediaController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'cgov_core';
  }

  /**
   * Return an infographic's long description in an HTTP Response.
   *
   * @param Drupal\media\Entity\Media $media
   *   Id of the infographic to render.
   */
  public function longDescription(Media $media) {

    if ($media == NULL) {
      throw new NotFoundHttpException();
    }

    // Only retrieve the field if it's available in the current language.
    $language = $this->languageManager()->getCurrentLanguage()->getId();
    if ($media->hasTranslation($language)) {
      $media = $media->getTranslation($language);

      // Only return a value if the field has a value. If it's missing or empty,
      // fall through to a NotFoundException.
      if (count($media->field_accessible_version) > 0) {

        $field = $media->field_accessible_version[0];
        if ($field != NULL) {
          $text = trim($field->getString());

          if (strlen($text) > 0) {
            $response = new Response();
            $response->setContent($text);
            $response->headers->set('Content-Type', 'text/plain; charset=UTF-8');
            return $response;
          }
        }
      }
    }

    // Couldn't find a value to return.
    throw new NotFoundHttpException();
  }

}
