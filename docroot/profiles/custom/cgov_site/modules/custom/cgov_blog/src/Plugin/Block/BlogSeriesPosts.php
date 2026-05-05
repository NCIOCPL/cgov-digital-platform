<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\node\NodeInterface;
use Drupal\views\Views;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a conditional blog series posts block for Layout Builder.
 *
 * @Block(
 *  id = "cgov_blog_series_posts",
 *  admin_label = @Translation("Cgov Blog Series Posts"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogSeriesPosts extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The blog manager.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  protected $blogManager;

  /**
   * Constructs a BlogSeriesPosts block.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_blog\Services\BlogManagerInterface $blog_manager
   *   The blog manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
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
    $blog_series = $this->blogManager->getBlogSeriesFromRoute();
    if (!$blog_series instanceof NodeInterface || $blog_series->bundle() !== 'cgov_blog_series') {
      return [];
    }

    $display_id = !empty($blog_series->field_show_list_thumbnails->value) ? 'block_bp_list_th' : 'block_bp_list';
    $view = Views::getView('cgov_block_blog_posts');
    if (!$view) {
      return [];
    }

    return $view->buildRenderable($display_id, [$blog_series->id()]);
  }

}
