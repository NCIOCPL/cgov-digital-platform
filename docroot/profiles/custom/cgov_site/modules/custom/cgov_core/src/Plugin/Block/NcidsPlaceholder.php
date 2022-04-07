<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a placeholder block that can have a twig template.
 *
 * This is just a simple placeholder that can have a twig template.
 * This will be used to add placeholder blocks while we work through
 * the tickets to make the real blocks.
 *
 * @Block(
 *  id = "ncids_placeholder",
 *  admin_label = "Placeholder Block",
 * )
 */
class NcidsPlaceholder extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#type' => 'block',
    ];
  }

}
