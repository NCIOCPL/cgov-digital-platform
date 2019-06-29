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
 *   id = "cgov_blog_featured_posts",
 *   admin_label = @Translation("Cgov Blog Featured Posts"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogFeaturedPosts extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The BlogManager object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  public $blogManager;

  /**
   * Constructs a blog entity object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_blog\Services\BlogManagerInterface $blog_manager
   *   A blog manager object.
   */
  public function __construct(
    // Constructor with args.
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
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
   * {@inheritdoc}
   */
  public function build() {
    // Build object.
    $build = [];

    // Return blog featured post block elements. TODO: clean up twig.
    $featured = $this->drawFeaturedPosts();
    $build = [
      '#featured' => $featured,
    ];
    return $build;
  }

  /**
   * Retrieve the title, URL, date, and author from each Featured Post.
   */
  private function drawFeaturedPosts() {
    $featured = [];
    $featured_nodes = $this->blogManager->getSeriesFeaturedPosts();

    // If we have featured posts, get the node data.
    if (!empty($featured_nodes)) {
      $i = 0;
      foreach ($featured_nodes as $node) {
        $featured[$i] = [
          'title' => $node->title->value,
          'href' => $this->blogManager->getBlogPathFromNid($node->id()),
          'date' => $node->field_date_posted->date->format('F j, Y'),
          'author' => $node->field_author->value,
        ];
        $i++;
      }
    }
    return $featured;
  }

}
