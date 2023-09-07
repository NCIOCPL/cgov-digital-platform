<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\cgov_blog\Services\BlogManager2Interface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
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
   * The BlogManager object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  public $blogManager;

  /**
   * The BlogManager2 object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManager2Interface
   */
  public $blogManager2;

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
   * @param \Drupal\cgov_blog\Services\BlogManager2Interface $blog_manager_2
   *   A blog manager 2 object.
   */
  public function __construct(
    // Constructor with args.
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager,
    BlogManager2Interface $blog_manager_2
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
    $this->blogManager2 = $blog_manager_2;
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
      $container->get('cgov_blog.blog_manager'),
      $container->get('cgov_blog.blog_manager_2')
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
    $blog_series = $this->blogManager2->getSeriesFromRoute();
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
    $result = AccessResult::forbidden();
    $blog_series = $this->blogManager2->getSeriesFromRoute();
    if (!isset($blog_series)) {
      return $result;
    }
    $blog_categories = $this->drawBlogCategories($blog_series);
    $series_nid = $blog_series->id();
    if (count($blog_categories) > 0) {
      $result = AccessResult::allowed();
    }
    return $result->addCacheTags(['node:' . $series_nid]);
  }

  /**
   * Draw category (topic) links.
   *
   * @param Drupal\Core\Entity\ContentEntityInterface $blog_series
   *   The blog series.
   */
  private function drawBlogCategories($blog_series) {
    $category_links = [];
    // Get all associated categories and build URL paths for this series.
    $categories = $this->blogManager2->getTopicsBySeries($blog_series);
    foreach ($categories as $cat) {
      $link = $this->getCategoryLink($cat->tid);
      $category_links[$link['link_name']] = $link['link_path'];
    }
    ksort($category_links);
    return $category_links;
  }

  /**
   * Get the pretty URL for a single taxonomy term.
   *
   * @param string $tid
   *   A taxonomy term ID.
   */
  private function getCategoryLink($tid) {
    $taxon = $this->blogManager->loadBlogTopic($tid);
    $param['topic'] = $taxon->get('field_topic_pretty_url')->value ?? $tid;
    $path = $this->blogManager->getSeriesPath($param);
    $link = [
      'link_name' => $taxon->name->value,
      'link_path' => $path,
    ];
    return $link;
  }

}
