<?php

namespace Drupal\cgov_core\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Drupal\cgov_core\Services\NavigationBlockManager;

/**
 * Controller for rendering navigation blocks.
 */
class CgovBlockController extends ControllerBase {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\NavigationBlockManager
   */
  protected $blockMgr;

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'cgov_core';
  }

  /**
   * Constructs an LanguageBar object.
   *
   * @param \Drupal\cgov_core\Services\NavigationBlockManager $navBlockManager
   *   Cgov navigation service.
   */
  public function __construct(NavigationBlockManager $navBlockManager) {
    $this->blockMgr = $navBlockManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('cgov_core.navigation_block')
    );
  }

  /**
   * Gets the markup for a named navigation block.
   *
   * @param string $block_id
   *   The navigation block to render.
   */
  public function getBlock(string $block_id = NULL) {

    if ($block_id == NULL) {
      throw new NotFoundHttpException();
    }

    $navTree = $this->blockMgr->getNavigationBlock($block_id);

    if (strlen($navTree) > 0) {
      $response = new Response();
      $response->setContent($navTree);
      $response->headers->set('Content-Type', 'text/plain');
      return $response;
    }

    throw new NotFoundHttpException();
  }

}
