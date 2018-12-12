<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\cgov_core\Services\PageOptionsManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block with page options.
 *
 * @Block(
 *  id = "page_options",
 *  admin_label = "Page Options",
 * )
 */
class PageOptions extends BlockBase implements ContainerFactoryPluginInterface {

  public $poResult = [];

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
  public function __construct(array $configuration, $plugin_id, $plugin_definition, PageOptionsManager $po_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->poResult = $po_manager->getConfig();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#type' => 'block',
      'options' => $this->poResult,
    ];
  }

}
