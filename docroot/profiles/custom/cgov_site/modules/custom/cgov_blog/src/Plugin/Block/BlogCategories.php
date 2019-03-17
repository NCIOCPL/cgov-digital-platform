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
    $nid = $this->currEntity->id();
    $this->seriesEntity = $blog_manager->getSeriesEntity($nid);
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
      // TODO: assign variables correctly.
    );
  }

  /**
   * Create HTML .
   *
   * {@inheritdoc}
   */
  public function build() {
    $isSeries = $this->currEntity->id();
    $working = (isset($isSeries)) ? $isSeries : 'nope';
    $build = [
      '#markup' => '<b><i>Debug BlogCategories.php->build(): </i></b>
                    <ol><li>' . $working . '</li></ol>',
    ];
    return $build;
  }

}
