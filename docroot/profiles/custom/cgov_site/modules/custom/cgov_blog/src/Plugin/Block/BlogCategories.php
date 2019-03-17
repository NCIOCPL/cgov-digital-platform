<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/*
 * NOTE: this is a dummy plugin for front-end templating only.
 * The innards are still being built out.
 */

/**
 * Provides a Featured Posts Block.
 *
 * @Block(
 *   id = "cgov_blog_categories",
 *   admin_label = @Translation("Cgov Blog Categories"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogCategories extends BlockBase implements ContainerFactoryPluginInterface {

  public $currEntity = FALSE;
  public $seriesEntity = [];

  /**
   * {@inheritdoc}
   */
  public function __construct(
    // Constructor with args.
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->currEntity = $blog_manager->getCurrentEntity();
    $this->seriesEntity = $blog_manager->getSeriesEntity('-1');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    // Construct a new instance of this class.
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_blog.blog_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $isSeries = '';
    $working = (isset($isSeries)) ? 'true' : 'false';
    $build = [
      '#markup' => '<b><i>Debug BlogCategories.php->build(): </i></b>
                    <ol><li>' . $working . '</li></ol>',
    ];
    return $build;
  }

}
