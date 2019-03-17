<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

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

  /**
   * The current entity.
   *
   * @var \Drupal\Core\Entity\ContentEntityInterface
   */
  public $currEntity;

  /**
   * The associated series entity.
   *
   * @var \Drupal\Core\Entity\ContentEntityInterface
   */
  public $seriesEntity;

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
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    // Create an instance of this plugin with the blog_manager service.
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_blog.blog_manager')
    );
  }

  /**
   * Create HTML .
   *
   * {@inheritdoc}
   */
  public function build() {
    // ToDO: Add null check.
    $curr_id = $this->currEntity->id();
    $series_id = 'placeholder';
    $build = [
      '#markup' => '
            <p>Debug BlogCategories.php:build()</p>
            <li>Current ID: ' . $curr_id . '</li>
            <li>Current ID: ' . $series_id . '</li>',
    ];
    return $build;
  }

}
