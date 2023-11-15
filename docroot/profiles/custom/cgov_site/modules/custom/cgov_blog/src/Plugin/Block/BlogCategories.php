<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;
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
   * Create HTML.
   *
   * {@inheritdoc}
   */
  public function build() {
    // Empty build object.
    $build = [];

    // Return blog category elements.
    $blog_series = $this->blogManager->getBlogSeriesFromRoute();
    // Add check to make sure $blog_series is not null.
    if (!isset($blog_series)) {
      return $build;
    }
    $blog_categories = $this->drawBlogCategories($blog_series);
    // Get series nid for the block.
    $build = [
      'blog_categories' => [
        '#theme' => 'cgov_blocks_blog_categories',
        '#rows' => $blog_categories,
      ],
    ];
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    if ($this->inPreview) {
      return AccessResult::allowed()->addCacheContexts(['route.name.is_layout_builder_ui']);
    }
    else {
      $blog_series = $this->blogManager->getBlogSeriesFromRoute();
      if (!isset($blog_series)) {
        return AccessResult::forbidden();
      }
      $blog_categories = $this->drawBlogCategories($blog_series);
      $series_nid = $blog_series->id();
      $result = AccessResult::forbidden();
      if (count($blog_categories) > 0) {
        $result = AccessResult::allowed();
      }
      $result->addCacheTags(['node:' . $series_nid]);
      return $result->addCacheContexts(['route.name.is_layout_builder_ui']);
    }
  }

  /**
   * Draw category (topic) links.
   *
   * @param \Drupal\node\NodeInterface $blog_series
   *   The blog series.
   *
   * @return array
   *   An array of the links associated to the topics.
   */
  private function drawBlogCategories(NodeInterface $blog_series) {
    $category_links = [];
    // Get all associated categories and build URL paths for this series.
    $terms = $this->blogManager->getFilteredTopicsBySeries($blog_series);
    foreach ($terms as $term) {
      $link = $this->getCategoryLinkFromTopic($term, $blog_series);
      $category_links[$link['link_name']] = $link['link_path'];
    }
    ksort($category_links);
    return $category_links;
  }

  /**
   * Get the pretty URL for a single taxonomy term.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   A taxonomy term ID.
   * @param \Drupal\node\NodeInterface $blog_series
   *   The blog series.
   *
   * @return array
   *   An array with the topic name and path.
   */
  private function getCategoryLinkFromTopic(TermInterface $term, NodeInterface $blog_series) {
    $param['topic'] = $term->get('field_topic_pretty_url')->value ?? $term->id();
    $path = $blog_series->toUrl('canonical', ['query' => $param])->toString();
    $link = [
      'link_name' => $term->label(),
      'link_path' => $path,
    ];
    return $link;
  }

}
