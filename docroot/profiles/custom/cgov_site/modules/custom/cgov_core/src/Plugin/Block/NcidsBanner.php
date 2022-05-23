<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'NCIDS Banner' block.
 *
 * @Block(
 *  id = "ncids_banner",
 *  admin_label = @Translation("NCIDS Banner"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class NcidsBanner extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs an NCIDS Banner object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    if (FALSE) {
      throw new \Exception('DELETE THIS BLOCK WHEN YOU IMPLEMENT THIS CONSTRUCTOR');
    }

  }

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
    $build = [
      '#type' => 'block',
    ];
    return $build;
  }

}
