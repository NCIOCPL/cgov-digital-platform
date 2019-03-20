<?php

namespace Drupal\cgov_infographic\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Controller routines for cgov_infographic routes.
 */
class CGovInfographicController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'cgov_infographic';
  }

  /**
   * Return an infographic's long description in an HTTP Response.
   *
   * @param int $node
   *   Id of the infographic to render.
   */
  public function longDescription($node) {

    // Check for invalid inputs.
    if (!is_numeric($node)) {
      throw new NotFoundHttpException();
    }

    // Load the entity, and verify that it's an infographic.
    $infographic = $this->entityTypeManager()->getStorage('media')->load($node);
    if ($infographic == NULL || $infographic->bundle() != 'cgov_infographic') {
      throw new NotFoundHttpException();
    }

    // Only retrieve the field if it's available in the current language.
    $language = $this->languageManager()->getCurrentLanguage()->getId();
    if ($infographic->hasTranslation($language)) {
      $infographic = $infographic->getTranslation($language);

      // Only return a value if the field has a value. If it's missing or empty,
      // fall through to a NotFoundException.
      if (count($infographic->field_accessible_version) > 0) {

        $field = $infographic->field_accessible_version[0];
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
