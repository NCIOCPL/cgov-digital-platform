<?php

namespace Drupal\cgov_infographic\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

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
   * Generates an infographic's long description.
   *
   * @param int $node
   *   Id of the infographic to render.
   */
  public function longDescription($node) {
    // Make sure you don't trust the URL to be safe! Always check for exploits.
    if (!is_numeric($node)) {
      // We will just show a standard "access denied" page in this case.
      throw new AccessDeniedHttpException();
    }

    return [
      '#markup' => $this->t('<p>Hello.</p>'),
    ];
  }

}
