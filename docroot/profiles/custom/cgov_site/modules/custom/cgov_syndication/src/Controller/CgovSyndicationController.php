<?php

namespace Drupal\cgov_syndication\Controller;

use Drupal\node\Controller\NodeViewController;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Controller routines for cgov_syndication routes.
 */
class CgovSyndicationController extends NodeViewController {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'cgov_syndication';
  }

  /**
   * Return an HTML rendering of a syndicated content item to HHS.
   *
   * @param Drupal\node\Entity\Node $node
   *   Content item to be syndicated.
   *
   * @return array
   *   The render array for the node.
   */
  public function publish(Node $node) {

    // Make sure we have a syndicatable piece of content.
    $bundles = ['cgov_article', 'pdq_cancer_information_summary'];
    if (empty($node) || !in_array($node->bundle(), $bundles)) {
      throw new NotFoundHttpException();
    }
    if (!$node->hasField('field_hhs_syndication')) {
      throw new NotFoundHttpException();
    }
    if (!$node->field_hhs_syndication->syndicate) {
      throw new NotFoundHttpException();
    }
    if (!$node->isPublished()) {
      throw new NotFoundHttpException();
    }

    // Let the base class handle it, using the right view mode.
    return parent::view($node, 'hhs_syndication');
  }

}
