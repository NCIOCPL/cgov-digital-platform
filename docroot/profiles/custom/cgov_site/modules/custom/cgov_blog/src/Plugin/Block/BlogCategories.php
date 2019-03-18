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
   * The BlogManager object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  public $blogManager;

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
   * Create HTML .
   *
   * {@inheritdoc}
   */
  public function build() {
    $markup = $this->drawBlogCategories();
    $build = [
      '#markup' => $markup,
    ];
    return $build;
  }

  /**
   * Draw categories.
   *
   * {@inheritdoc}
   */
  private function drawBlogCategories() {
    // ToDO: Add null check.
    $categories = $this->blogManager->getSeriesCategories();

    $list = '';
    foreach ($categories as $cat) {
      $url = '#';
      $name = $cat->name;

      $list .= '
        <li class="general-list-item general list-item">
          <div class="title-and-desc title desc container">
            <a class="title" href="' . $url . '">' . $name . '
            </a>
          </div><!-- end title & desc container -->
        </li>';
    }

    return $list;
  }

}
