<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\cgov_core\Services\PageOptionsManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Provides a block with page options.
 *
 * @Block(
 *  id = "page_options",
 *  admin_label = "Page Options",
 * )
 */
class PageOptions extends BlockBase implements ContainerFactoryPluginInterface {

  public $pageOptionsConfigs = [];

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.page_options_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, PageOptionsManagerInterface $po_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->pageOptionsConfigs = $po_manager->getConfig();
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    if ($this->pageOptionsConfigs) {
      // By default, the block is visible.
      return AccessResult::allowed();
    }
    // Do not render block if page options config is empty
    // (not a node or unrecognized node type)
    return AccessResult::forbidden();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#type' => 'block',
      'options' => $this->pageOptionsConfigs,
    ];
  }

}
